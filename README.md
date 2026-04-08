# atomity-cloud-cost
# Atomity — Cloud Cost Explorer

A scroll-triggered, drill-down Kubernetes cost explorer built for the Atomity frontend engineering challenge.

**Live demo:** [(https://atomity-cloud-cost.vercel.app/)]  
**Repository:** [https://github.com/Joshua-Onyekachukwu/atomity-cloud-cost]

---

## Feature chosen

**Option A (0:30–0:40)** — the cluster cost breakdown view with drill-down navigation.

The reference video showed a simple bar chart with solid green blocks and a flat cost table. My interpretation goes significantly further:

- **Stacked segmented bars** — each bar is broken into 5 colour-coded resource layers (CPU, RAM, Storage, Network, GPU) so you immediately see where money is going within each node, not just the total
- **3-level drill-down** — Clusters → Namespaces → Pods, with directional slide animations that feel like navigating a file system
- **Savings opportunity callout** — automatically detects low-efficiency nodes and surfaces an estimated savings figure, which the reference had no equivalent of
- **Pod level summary** — a contextual insight card appears at the deepest level showing most expensive pod, most efficient pod, and avg efficiency

---

## Animation approach

All animations use **Framer Motion** with intentional, physically grounded timing.

| Animation | Technique |
|---|---|
| Section entrance | `useInView` scroll trigger, `once: true` so it only fires on first scroll |
| Bar entrance | Staggered `scaleY` from bottom, each bar delayed by `index * 80ms` |
| Bar column entry | `opacity + y` fade-up with spring easing `[0.22, 1, 0.36, 1]` |
| Number counters | Custom `useCountUp` hook — ease-out cubic via `requestAnimationFrame` |
| Drill-down transition | Directional slide — drilling down slides right→left, navigating back slides left→right |
| Hover tooltip | `AnimatePresence` scale + opacity, `0.15s easeOut` |
| KPI summary | Staggered fade-up, each card delayed by `i * 70ms` |
| Savings callout | Scale + opacity entrance, only mounts when low-efficiency nodes exist |
| Theme toggle | CSS variable swap on `data-theme` attribute — instant, no flash |

`prefers-reduced-motion` is respected globally in `globals.css` — all animation durations collapse to `0.01ms` and the `useCountUp` hook snaps to the target value immediately.

---

## Token and styling architecture

All design decisions live in two places and nowhere else:

**`src/app/globals.css`** — CSS custom properties for every value:
```css
:root {
  --color-bg-primary: #f2f7f4;
  --color-accent-primary: #00c85a;
  --radius-md: 12px;
  --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.08);
  --font-size-base: clamp(0.9rem, 0.86rem + 0.19vw, 1rem);
  /* ... */
}

[data-theme='dark'] {
  --color-bg-primary: #06100a;
  --color-accent-primary: #00e87a;
  /* ... overrides only */
}
```

**`src/tokens/index.ts`** — typed JS references so components never hardcode values:
```ts
export const tokens = {
  colors: {
    bgPrimary: 'var(--color-bg-primary)',
    accentPrimary: 'var(--color-accent-primary)',
    // ...
  },
} as const;
```

Components import from `tokens` — no hex values anywhere in component files.

### Modern CSS features used

| Feature | Where |
|---|---|
| `clamp()` | Fluid typography (`--font-size-*`) and fluid spacing (`padding`, `margin`) |
| `color-mix()` | Table row highlight on hover — `color-mix(in srgb, var(--color-warning) 5%, transparent)` |
| CSS nesting | `.cost-table` — nested `& tbody tr`, `& th`, `& td` selectors |
| `:has()` | Table rows containing `.efficiency-warning` or `.efficiency-critical` badges get automatic background tint |
| Container queries | `@container cost-card` — bar chart dimensions respond to component width, not viewport |
| Logical properties | `padding-inline`, `margin-inline`, `border-block-end` throughout |

---

## Data fetching and caching

**Source:** [DummyJSON Products API](https://dummyjson.com/products)  
**Hook:** `useCloudData` via TanStack Query v5
DummyJSON /products
↓
buildHierarchy()         — maps 64 products into 4 clusters × 4 namespaces × 4 pods
↓
React Query cache        — staleTime: 5min, gcTime: 10min
↓
scaleHierarchy(data, TIME_MULTIPLIERS[timeRange])   — useMemo, recomputes on time range change only
↓
displayedItems           — resolved by walking drillPath[] against scaledData
↓
BarChart + CostTable + SummaryBar + SavingsCallout

**Caching behaviour:**
- First load: skeleton shown while fetching
- Subsequent navigation: instant — data served from React Query cache, no network request
- Time range switch: no re-fetch — `scaleHierarchy` recomputes from cached data via `useMemo`
- Drill-down: no re-fetch — `drillPath` array walks the already-cached hierarchy

---

## Component structure

The project follows a strict separation of concerns across five layers:

**Foundation** — `tokens/index.ts` and `app/globals.css` together form the design system. CSS variables define every value; the tokens file gives components typed JS references to those variables. No hex values appear in component files.

**Data layer** — `lib/dataTransform.ts` owns the API shape and hierarchy logic. `hooks/useCloudData.ts` owns the fetch and cache contract. These two files are the only places that know about DummyJSON or time multipliers.

**Primitive components** — small, single-purpose, no business logic:

| Component | Responsibility |
|---|---|
| `Badge` | Status pill with `semanticClass` prop that enables CSS `:has()` row highlighting |
| `TimeFilter` | 7D / 30D / 90D toggle — pure controlled input |
| `ThemeToggle` | Dark/light button — reads and writes via `useTheme` |
| `LoadingSkeleton` | Shimmer skeleton that mirrors the real card layout |
| `ErrorState` | Error display with retry callback |
| `Tooltip` | Hover popup showing full resource breakdown per node |
| `Breadcrumb` | Drill path with `AnimatePresence` slide-in crumbs |

**Chart components** — the two visual centrepieces:

| File | Responsibility |
|---|---|
| `BarChart/index.tsx` | Container — legend, grid lines, `AnimatePresence` level transitions |
| `BarChart/BarColumn.tsx` | Single stacked bar — `scaleY` segments, countUp label, hover tooltip, drill hint |
| `CostTable/index.tsx` | Table container with exit/enter animation on level change |
| `CostTable/TableRow.tsx` | Animated row — `useCountUp` on total, efficiency badge, `:has()` class |

**Orchestrator** — `CloudCostSection/index.tsx` owns all state: time range, drill path, selected node, and drill direction. It derives `displayedItems` via `useMemo` and passes everything down as props. No child component fetches data or manages navigation state.

Every component is built from scratch — no MUI, Chakra, shadcn, or any pre-built component library.

## Libraries used

| Library | Version | Why |
|---|---|---|
| Next.js | 14 | App Router, server components, file-based routing |
| React | 18 | Concurrent features, `useTransition` readiness |
| Framer Motion | 11 | `AnimatePresence`, `useInView`, spring physics, `variants` |
| TanStack Query | 5 | Declarative caching, `staleTime`/`gcTime`, automatic retry |
| TypeScript | 5 | Strict mode — catches token misuse and prop errors at compile time |
| Tailwind CSS | 3 | Utility classes for layout; token values aliased via `tailwind.config.ts` |

---

## Tradeoffs and decisions

**DummyJSON instead of real cloud data**  
The challenge required a public API. DummyJSON product prices were too variable (ranging $10–$1,500), causing one bar to dwarf all others. The fix was `CLUSTER_TARGETS[]` and `NAMESPACE_WEIGHTS[]` — fixed budget envelopes per level that give the bars realistic proportions regardless of raw API values. `scaleHierarchy()` then multiplies the whole tree by a time multiplier so 7D/30D/90D all feel meaningfully different.

**Drill path as `string[]` not node references**  
Originally the drill path stored `HierarchyNode` references. When the time range changed and `scaleHierarchy` produced new node objects, the stored references were stale and showed unscaled values. Switching to a `string[]` of IDs means `displayedItems` re-resolves against fresh `scaledData` on every `useMemo` recompute.

**Inline styles over Tailwind for component logic**  
Dynamic values (e.g. bar height as `${heightPct}%`, colours driven by efficiency score) cannot be expressed as Tailwind classes at runtime without `style` props. The decision was to use inline styles for all dynamic values and Tailwind only for static layout utilities — keeping the token system clean and avoiding Tailwind's JIT purge issues with dynamic class names.

**No `React.memo` on leaf components**  
Given the scope of this project (max 16 visible nodes at any level), memoisation would add complexity without measurable benefit. In a production scenario with hundreds of nodes, `React.memo` on `BarColumn` and `TableRow` would be the first optimisation.

---

## What I would improve with more time

- **Real WebSocket / SSE updates** — live cost deltas streaming in so bars animate as spend accumulates
- **Sortable table columns** — click CPU/RAM/Total column headers to re-sort
- **Search / filter** — type to filter nodes by name within a level
- **Cost trend sparklines** — mini line chart inside each table row showing spend over the selected time window
- **Export to CSV** — download the current view as a spreadsheet
- **`React.memo` + `useMemo`** on leaf nodes for large datasets
- **E2E tests** with Playwright covering the full drill-down flow
- **Storybook** for isolated component development and visual regression testing