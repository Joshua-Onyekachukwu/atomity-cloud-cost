'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRef } from 'react';
import { tokens } from '@/tokens';
import { useCloudData } from '@/hooks/useCloudData';
import { useTheme } from '@/hooks/useTheme';
import { Breadcrumb } from '@/components/Breadcrumb';
import { TimeFilter } from '@/components/TimeFilter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BarChart } from '@/components/BarChart';
import { CostTable } from '@/components/CostTable';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import type { HierarchyNode, BreadcrumbEntry, DrillLevel, TimeRange } from '@/types';

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function formatCurrency(n: number): string {
  return `$${n.toLocaleString()}`;
}

function getLevelFromDepth(depth: number): DrillLevel {
  if (depth === 0) return 'cluster';
  if (depth === 1) return 'namespace';
  return 'pod';
}

/* Time-range multiplier — scales totals so 7D / 30D / 90D feel different */
const TIME_MULTIPLIERS: Record<TimeRange, number> = {
  '7d':  0.23,
  '30d': 1,
  '90d': 3.1,
};

/* ─────────────────────────────────────────
   Summary KPI bar
───────────────────────────────────────── */
function SummaryBar({
  items,
  timeRange,
}: {
  items: HierarchyNode[];
  timeRange: TimeRange;
}) {
  const multiplier  = TIME_MULTIPLIERS[timeRange];
  const totalCost   = Math.round(items.reduce((s, i) => s + i.total, 0) * multiplier);
  const avgEfficiency = Math.round(
    items.reduce((s, i) => s + i.efficiency, 0) / items.length,
  );
  const gpuNodes    = items.filter((i) => i.breakdown.gpu > 0).length;
  const highestItem = items.reduce((a, b) => (a.total > b.total ? a : b));

  const kpis = [
    {
      label: 'Total Spend',
      value: formatCurrency(totalCost),
      sub:   `across ${items.length} nodes`,
      color: tokens.colors.accentPrimary,
    },
    {
      label: 'Avg Efficiency',
      value: `${avgEfficiency}%`,
      sub:   avgEfficiency < 30 ? '⚠ Low — review allocations' : '✓ Healthy',
      color: avgEfficiency < 30 ? tokens.colors.warning : tokens.colors.success,
    },
    {
      label: 'Highest Cost',
      value: highestItem.displayName,
      sub:   formatCurrency(Math.round(highestItem.total * multiplier)),
      color: tokens.colors.textPrimary,
    },
    {
      label: 'GPU Nodes',
      value: `${gpuNodes}`,
      sub:   `of ${items.length} active`,
      color: tokens.colors.gpu,
    },
  ];

  return (
    <div
      style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap:                 '1px',
        backgroundColor:     tokens.colors.border,
        borderRadius:        tokens.radius.md,
        overflow:            'hidden',
        marginBottom:        '4px',
      }}
    >
      {kpis.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.07, ease: 'easeOut' }}
          style={{
            backgroundColor: tokens.colors.bgSubtle,
            padding:         'clamp(12px, 2vw, 20px)',
            display:         'flex',
            flexDirection:   'column',
            gap:             '4px',
          }}
        >
          <span
            style={{
              fontSize:  'var(--font-size-xs)',
              fontWeight: 500,
              color:     tokens.colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {kpi.label}
          </span>
          <span
            style={{
              fontSize:  'var(--font-size-xl)',
              fontWeight: 700,
              color:     kpi.color,
              lineHeight: 1.1,
              overflow:   'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {kpi.value}
          </span>
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color:    tokens.colors.textMuted,
            }}
          >
            {kpi.sub}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Section
───────────────────────────────────────── */
export function CloudCostSection() {
  const { theme, toggleTheme } = useTheme();
  const { data, isLoading, isError, error, refetch } = useCloudData();

  const [timeRange,   setTimeRange]   = useState<TimeRange>('30d');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbEntry[]>([]);
  const [currentItems, setCurrentItems] = useState<HierarchyNode[] | null>(null);
  const [selectedId,  setSelectedId]  = useState<string | null>(null);

  // Scroll-triggered animation
  const sectionRef = useRef<HTMLElement>(null);
  const isInView   = useInView(sectionRef, { once: true, margin: '-80px' });

  /* Derive displayed items — root clusters or drilled children */
  const displayedItems: HierarchyNode[] = currentItems ?? (data ?? []);
  const currentLevel: DrillLevel = getLevelFromDepth(breadcrumbs.length);
  const hasDrillDown = currentLevel !== 'pod';

  /* Drill into a node */
  const handleDrillDown = useCallback(
    (item: HierarchyNode) => {
      if (item.children.length === 0) return;
      setBreadcrumbs((prev) => [
        ...prev,
        { id: item.id, name: item.displayName, level: currentLevel },
      ]);
      setCurrentItems(item.children);
      setSelectedId(null);
    },
    [currentLevel],
  );

  /* Navigate back via breadcrumb */
  const handleNavigate = useCallback(
    (index: number) => {
      if (index === 0) {
        // Back to root
        setBreadcrumbs([]);
        setCurrentItems(null);
        setSelectedId(null);
        return;
      }
      // Navigate to a mid-level crumb
      const targetCrumb = breadcrumbs[index - 1];
      const targetNode  = findNode(data ?? [], targetCrumb.id);
      if (!targetNode) return;
      setBreadcrumbs((prev) => prev.slice(0, index));
      setCurrentItems(targetNode.children);
      setSelectedId(null);
    },
    [breadcrumbs, data],
  );

  /* ── Render ── */
  return (
    <section
      ref={sectionRef}
      aria-label="Cloud cost explorer"
      style={{ maxWidth: '960px', marginInline: 'auto' }}
    >
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          flexWrap:       'wrap',
          gap:            '12px',
          marginBottom:   'clamp(24px, 4vw, 40px)',
        }}
      >
        <div>
          <h1
            style={{
              fontSize:   'var(--font-size-2xl)',
              fontWeight: 800,
              color:      tokens.colors.textPrimary,
              lineHeight: 1.15,
            }}
          >
            Cost Explorer
          </h1>
          <p
            style={{
              fontSize:    'var(--font-size-sm)',
              color:       tokens.colors.textMuted,
              marginTop:   '4px',
            }}
          >
            Drill into clusters, namespaces, and pods to understand your spend.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TimeFilter value={timeRange} onChange={setTimeRange} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </motion.div>

      {/* Loading */}
      {isLoading && <LoadingSkeleton />}

      {/* Error */}
      {isError && (
        <ErrorState
          message={error?.message ?? 'Could not load cost data.'}
          onRetry={() => refetch()}
        />
      )}

      {/* Main card */}
      {data && !isLoading && (
        <motion.div
          className="cost-card-container"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            backgroundColor: tokens.colors.bgCard,
            borderRadius:    tokens.radius.xl,
            padding:         'clamp(20px, 4vw, 36px)',
            boxShadow:       tokens.shadow.lg,
            display:         'flex',
            flexDirection:   'column',
            gap:             'clamp(20px, 3vw, 32px)',
          }}
        >
          {/* Card header — breadcrumb + level info */}
          <div
            style={{
              display:        'flex',
              alignItems:     'flex-start',
              justifyContent: 'space-between',
              flexWrap:       'wrap',
              gap:            '12px',
            }}
          >
            <Breadcrumb
              entries={breadcrumbs}
              currentLevel={currentLevel}
              onNavigate={handleNavigate}
            />

            {/* Node count badge */}
            <span
              style={{
                fontSize:        'var(--font-size-xs)',
                fontWeight:      600,
                color:           tokens.colors.textMuted,
                backgroundColor: tokens.colors.bgSubtle,
                borderRadius:    tokens.radius.full,
                paddingInline:   '10px',
                paddingBlock:    '4px',
                border:          `1px solid ${tokens.colors.border}`,
                whiteSpace:      'nowrap',
              }}
            >
              {displayedItems.length} {currentLevel}s
            </span>
          </div>

          {/* KPI summary bar */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`summary-${currentLevel}-${timeRange}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SummaryBar items={displayedItems} timeRange={timeRange} />
            </motion.div>
          </AnimatePresence>

          {/* Divider */}
          <hr style={{ border: 'none', borderTop: `1px solid ${tokens.colors.border}` }} />

          {/* Bar chart */}
          <BarChart
            items={displayedItems}
            selectedId={selectedId}
            isActive={isInView}
            hasDrillDown={hasDrillDown}
            onSelect={setSelectedId}
            onDrillDown={handleDrillDown}
          />

          {/* Divider */}
          <hr style={{ border: 'none', borderTop: `1px solid ${tokens.colors.border}` }} />

          {/* Cost table */}
          <CostTable
            items={displayedItems}
            selectedId={selectedId}
            isActive={isInView}
            onSelect={(id) => {
              setSelectedId(id);
              const item = displayedItems.find((i) => i.id === id);
              if (item && hasDrillDown) handleDrillDown(item);
            }}
          />

          {/* Pod-level back hint */}
          <AnimatePresence>
            {currentLevel === 'pod' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  textAlign: 'center',
                  fontSize:  'var(--font-size-xs)',
                  color:     tokens.colors.textMuted,
                  fontStyle: 'italic',
                }}
              >
                Deepest level reached — use the breadcrumb to navigate back up.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────
   Utility — find a node anywhere in the tree
───────────────────────────────────────── */
function findNode(
  nodes: HierarchyNode[],
  id: string,
): HierarchyNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
}