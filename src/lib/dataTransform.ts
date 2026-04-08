import type { CostBreakdown, CostItem, HierarchyNode } from '@/types';

/* ─────────────────────────────────────────
   DummyJSON response shape
───────────────────────────────────────── */
interface DummyProduct {
  id:       number;
  title:    string;
  price:    number;
  rating:   number;
  category: string;
}

interface DummyResponse {
  products: DummyProduct[];
}

/* ─────────────────────────────────────────
   Static hierarchy blueprint
───────────────────────────────────────── */
const CLUSTERS = [
  { id: 'cluster-0', name: 'production-us-east', displayName: 'Production US-East' },
  { id: 'cluster-1', name: 'staging-eu-west',    displayName: 'Staging EU-West'    },
  { id: 'cluster-2', name: 'dev-ap-south',       displayName: 'Dev AP-South'       },
  { id: 'cluster-3', name: 'ml-us-west',         displayName: 'ML US-West'         },
];

const NAMESPACES = ['api', 'workers', 'data', 'monitoring'];

/* ─────────────────────────────────────────
   Target cost ranges per level (in USD)
   These keep bars visually comparable
───────────────────────────────────────── */
const CLUSTER_TARGETS   = [18000, 12000, 9500, 14500];
const NAMESPACE_WEIGHTS = [0.38, 0.28, 0.20, 0.14];
const POD_WEIGHTS       = [0.44, 0.28, 0.18, 0.10];

/* ─────────────────────────────────────────
   Normalize a value from one range into another
───────────────────────────────────────── */
function normalize(
  value:  number,
  inMin:  number,
  inMax:  number,
  outMin: number,
  outMax: number,
): number {
  if (inMax === inMin) return (outMin + outMax) / 2;
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

/* ─────────────────────────────────────────
   Derive cost breakdown from a budget + product metadata
───────────────────────────────────────── */
function deriveCosts(
  budget:  number,
  id:      number,
  rating:  number,
): { breakdown: CostBreakdown; total: number; efficiency: number } {
  const total = Math.round(budget);

  // Every 3rd node has a GPU workload
  const hasGPU      = id % 3 === 0;
  const gpuFraction = hasGPU ? 0.20 : 0;
  const gpu         = Math.round(total * gpuFraction);
  const remaining   = total - gpu;

  const cpu     = Math.round(remaining * 0.40);
  const ram     = Math.round(remaining * 0.22);
  const storage = Math.round(remaining * 0.10);
  const network = remaining - cpu - ram - storage;

  // Efficiency derived from rating (1–5 → 5%–90%)
  const efficiency = Math.min(90, Math.max(5, Math.round(rating * 17)));

  return {
    total,
    efficiency,
    breakdown: {
      cpu,
      ram,
      storage,
      network: Math.max(0, network),
      gpu,
    },
  };
}

/* ─────────────────────────────────────────
   Aggregate children into a parent node
───────────────────────────────────────── */
function aggregate(
  children: HierarchyNode[],
): Pick<CostItem, 'breakdown' | 'total' | 'efficiency'> {
  const total      = children.reduce((s, c) => s + c.total, 0);
  const efficiency = Math.round(
    children.reduce((s, c) => s + c.efficiency, 0) / children.length,
  );
  const breakdown: CostBreakdown = children.reduce(
    (acc, c) => ({
      cpu:     acc.cpu     + c.breakdown.cpu,
      ram:     acc.ram     + c.breakdown.ram,
      storage: acc.storage + c.breakdown.storage,
      network: acc.network + c.breakdown.network,
      gpu:     acc.gpu     + c.breakdown.gpu,
    }),
    { cpu: 0, ram: 0, storage: 0, network: 0, gpu: 0 },
  );
  return { total, efficiency, breakdown };
}

/* ─────────────────────────────────────────
   Build a readable pod slug from a product title
───────────────────────────────────────── */
function toSlug(title: string): string {
  return title
    .split(' ')
    .slice(0, 3)
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');
}

/* ─────────────────────────────────────────
   Build the full 3-level hierarchy
───────────────────────────────────────── */
export function buildHierarchy(products: DummyProduct[]): HierarchyNode[] {
  // Pad to 64 items if needed
  const padded = [...products];
  while (padded.length < 64) {
    padded.push({
      ...products[padded.length % products.length],
      id: padded.length + 1000,
    });
  }
  const source = padded.slice(0, 64);

  // Pre-compute min/max rating for normalization
  const ratings   = source.map((p) => p.rating);
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);

  return CLUSTERS.map((cluster, ci) => {
    const clusterBudget   = CLUSTER_TARGETS[ci];
    const clusterProducts = source.slice(ci * 16, (ci + 1) * 16);

    const namespaceNodes: HierarchyNode[] = NAMESPACES.map((nsSlug, ni) => {
      const nsBudget   = clusterBudget * NAMESPACE_WEIGHTS[ni];
      const nsProducts = clusterProducts.slice(ni * 4, (ni + 1) * 4);

      const podNodes: HierarchyNode[] = nsProducts.map((p, pi) => {
        const podBudget  = nsBudget * POD_WEIGHTS[pi];
        const normRating = normalize(p.rating, minRating, maxRating, 1, 5);
        const { total, efficiency, breakdown } = deriveCosts(podBudget, p.id, normRating);

        return {
          id:          `pod-${p.id}`,
          name:        `${toSlug(p.title)}-pod`,
          displayName: `${toSlug(p.title)}-pod`,
          total,
          efficiency,
          breakdown,
          children: [],
        };
      });

      const nsAgg = aggregate(podNodes);
      return {
        id:          `ns-${ci}-${ni}`,
        name:        nsSlug,
        displayName: nsSlug,
        ...nsAgg,
        children: podNodes,
      };
    });

    const clusterAgg = aggregate(namespaceNodes);
    return {
      ...cluster,
      ...clusterAgg,
      children: namespaceNodes,
    };
  });
}

/* ─────────────────────────────────────────
   Scale a full hierarchy by a time multiplier
   Called in CloudCostSection via useMemo
───────────────────────────────────────── */
export function scaleHierarchy(
  nodes:      HierarchyNode[],
  multiplier: number,
): HierarchyNode[] {
  return nodes.map((node) => ({
    ...node,
    total: Math.round(node.total * multiplier),
    breakdown: {
      cpu:     Math.round(node.breakdown.cpu     * multiplier),
      ram:     Math.round(node.breakdown.ram     * multiplier),
      storage: Math.round(node.breakdown.storage * multiplier),
      network: Math.round(node.breakdown.network * multiplier),
      gpu:     Math.round(node.breakdown.gpu     * multiplier),
    },
    // Recursively scale children too
    children: scaleHierarchy(node.children, multiplier),
  }));
}

/* ─────────────────────────────────────────
   Public fetch — called by React Query
───────────────────────────────────────── */
export async function fetchCloudHierarchy(): Promise<HierarchyNode[]> {
  const res = await fetch(
    'https://dummyjson.com/products?limit=100&select=id,title,price,rating,category',
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
  }

  const data: DummyResponse = await res.json();
  return buildHierarchy(data.products);
}