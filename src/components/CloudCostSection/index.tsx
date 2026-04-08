'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { tokens } from '@/tokens';
import { useCloudData, TIME_MULTIPLIERS } from '@/hooks/useCloudData';
import { scaleHierarchy } from '@/lib/dataTransform';
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

/* ─────────────────────────────────────────
   Summary KPI bar
───────────────────────────────────────── */
function SummaryBar({ items }: { items: HierarchyNode[] }) {
  const totalCost     = items.reduce((s, i) => s + i.total, 0);
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
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" />
          <path d="M8 4.5v1M8 10.5v1M5.5 6.5a2.5 1.5 0 0 1 5 0c0 1-1 1.5-2.5 2s-2.5 1-2.5 2a2.5 1.5 0 0 0 5 0" />
        </svg>
      ),
    },
    {
      label: 'Avg Efficiency',
      value: `${avgEfficiency}%`,
      sub:   avgEfficiency < 30 ? '⚠ Low — review allocations' : '✓ Healthy',
      color: avgEfficiency < 30 ? tokens.colors.warning : tokens.colors.success,
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 12 L6 7 L9 10 L13 4" />
          <path d="M11 4h2v2" />
        </svg>
      ),
    },
    {
      label: 'Highest Cost',
      value: highestItem.displayName,
      sub:   formatCurrency(highestItem.total),
      color: tokens.colors.textPrimary,
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 2L8 11M5 5l3-3 3 3" />
          <path d="M3 14h10" />
        </svg>
      ),
    },
    {
      label: 'GPU Nodes',
      value: `${gpuNodes}`,
      sub:   `of ${items.length} active`,
      color: tokens.colors.gpu,
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="1.5" y="4" width="13" height="8" rx="1.5" />
          <path d="M4 4V2.5M8 4V2.5M12 4V2.5M4 12v1.5M8 12v1.5M12 12v1.5" />
          <rect x="4" y="6.5" width="2" height="3" rx="0.5" fill="currentColor" stroke="none" />
          <rect x="7" y="6.5" width="2" height="3" rx="0.5" fill="currentColor" stroke="none" />
          <rect x="10" y="6.5" width="2" height="3" rx="0.5" fill="currentColor" stroke="none" />
        </svg>
      ),
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
            gap:             '6px',
          }}
        >
          {/* Icon + label row */}
          <div
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        '6px',
              color:      tokens.colors.textMuted,
            }}
          >
            {kpi.icon}
            <span
              style={{
                fontSize:      'var(--font-size-xs)',
                fontWeight:    500,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {kpi.label}
            </span>
          </div>

          {/* Value */}
          <span
            style={{
              fontSize:     'var(--font-size-xl)',
              fontWeight:   700,
              color:        kpi.color,
              lineHeight:   1.1,
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              whiteSpace:   'nowrap',
            }}
          >
            {kpi.value}
          </span>

          {/* Sub label */}
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
   Savings Callout
   Appears when low-efficiency nodes are detected
───────────────────────────────────────── */
function SavingsCallout({ items }: { items: HierarchyNode[] }) {
  const lowEfficiency = items.filter((i) => i.efficiency < 30);

  if (lowEfficiency.length === 0) return null;

  const potentialSavings = lowEfficiency.reduce((sum, item) => {
    const wastedFraction = 1 - item.efficiency / 100;
    return sum + Math.round(item.total * wastedFraction * 0.6);
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.99 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{    opacity: 0, y: -6, scale: 0.99 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      role="alert"
      aria-live="polite"
      style={{
        display:         'flex',
        alignItems:      'flex-start',
        justifyContent:  'space-between',
        flexWrap:        'wrap',
        gap:             '12px',
        backgroundColor: tokens.colors.warningBg,
        border:          `1px solid ${tokens.colors.warning}`,
        borderRadius:    tokens.radius.md,
        padding:         '14px 16px',
      }}
    >
      {/* Left — icon + message */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div
          aria-hidden="true"
          style={{
            flexShrink:      0,
            width:           '32px',
            height:          '32px',
            borderRadius:    tokens.radius.full,
            backgroundColor: tokens.colors.warningBg,
            border:          `1px solid ${tokens.colors.warning}`,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            color:           tokens.colors.warning,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 1.5 L14.5 13.5 H1.5 Z" />
            <line x1="8" y1="6"   x2="8" y2="9.5" />
            <line x1="8" y1="11" x2="8" y2="11.5" />
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: tokens.colors.warning }}>
            💡 Savings opportunity detected
          </p>
          <p style={{ fontSize: 'var(--font-size-xs)', color: tokens.colors.textSecondary, maxWidth: '480px' }}>
            {lowEfficiency.length === 1
              ? `${lowEfficiency[0].displayName} has low efficiency (${lowEfficiency[0].efficiency}%).`
              : `${lowEfficiency.length} nodes have efficiency below 30%.`
            }{' '}
            Optimising these could save approximately{' '}
            <strong style={{ color: tokens.colors.warning }}>
              ${potentialSavings.toLocaleString()}
            </strong>{' '}
            this period.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
            {lowEfficiency.map((item) => (
              <span
                key={item.id}
                style={{
                  fontSize:        'var(--font-size-xs)',
                  fontWeight:      600,
                  color:           tokens.colors.warning,
                  backgroundColor: tokens.colors.warningBg,
                  border:          `1px solid ${tokens.colors.warning}`,
                  borderRadius:    tokens.radius.full,
                  paddingInline:   '8px',
                  paddingBlock:    '3px',
                }}
              >
                {item.displayName} · {item.efficiency}%
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — savings badge */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
        <span style={{ fontSize: 'var(--font-size-xs)', color: tokens.colors.textMuted, fontWeight: 500 }}>
          Est. potential savings
        </span>
        <span
          className="pulse-glow"
          style={{
            fontSize:           'var(--font-size-xl)',
            fontWeight:         800,
            color:              tokens.colors.warning,
            backgroundColor:    tokens.colors.warningBg,
            border:             `1px solid ${tokens.colors.warning}`,
            borderRadius:       tokens.radius.md,
            paddingInline:      '12px',
            paddingBlock:       '6px',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          ${potentialSavings.toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Pod Level State — Fix #8
   Shown at the bottom when deepest level is reached
───────────────────────────────────────── */
function PodLevelState({ items }: { items: HierarchyNode[] }) {
  const totalCost     = items.reduce((s, i) => s + i.total, 0);
  const avgEfficiency = Math.round(
    items.reduce((s, i) => s + i.efficiency, 0) / items.length,
  );
  const mostExpensive = items.reduce((a, b) => (a.total > b.total ? a : b));
  const mostEfficient = items.reduce((a, b) =>
    a.efficiency > b.efficiency ? a : b,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{    opacity: 0, y: 8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display:         'flex',
        flexDirection:   'column',
        gap:             '12px',
        backgroundColor: tokens.colors.bgSubtle,
        border:          `1px solid ${tokens.colors.border}`,
        borderRadius:    tokens.radius.md,
        padding:         '16px 20px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          aria-hidden="true"
          style={{
            width:           '28px',
            height:          '28px',
            borderRadius:    tokens.radius.sm,
            backgroundColor: tokens.colors.accentDim,
            border:          `1px solid ${tokens.colors.accentPrimary}`,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            color:           tokens.colors.accentPrimary,
            flexShrink:      0,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
            <path d="M4 6l2.5 2L4 10" />
            <path d="M8.5 10h3" />
          </svg>
        </div>

        <div>
          <p
            style={{
              fontSize:   'var(--font-size-sm)',
              fontWeight: 700,
              color:      tokens.colors.textPrimary,
              lineHeight: 1.2,
            }}
          >
            Pod level — deepest view
          </p>
          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              color:    tokens.colors.textMuted,
            }}
          >
            Use the breadcrumb above to navigate back up
          </p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${tokens.colors.border}` }} />

      {/* Pod insights grid */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap:                 '12px',
        }}
      >
        {/* Total pod spend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: tokens.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
            Total pod spend
          </span>
          <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: tokens.colors.accentPrimary, fontVariantNumeric: 'tabular-nums' }}>
            ${totalCost.toLocaleString()}
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: tokens.colors.textMuted }}>
            across {items.length} pods
          </span>
        </div>

        {/* Avg efficiency */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: tokens.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
            Avg efficiency
          </span>
          <span
            style={{
              fontSize:  'var(--font-size-lg)',
              fontWeight: 700,
              color:     avgEfficiency >= 50
                ? tokens.colors.success
                : avgEfficiency >= 25
                ? tokens.colors.warning
                : tokens.colors.error,
            }}
          >
            {avgEfficiency}%
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: tokens.colors.textMuted }}>
            {avgEfficiency >= 50 ? 'Well optimised' : 'Needs attention'}
          </span>
        </div>

        {/* Most expensive pod */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: tokens.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
            Most expensive
          </span>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: tokens.colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {mostExpensive.displayName}
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: tokens.colors.textMuted, fontVariantNumeric: 'tabular-nums' }}>
            ${mostExpensive.total.toLocaleString()}
          </span>
        </div>

        {/* Most efficient pod */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: tokens.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
            Most efficient
          </span>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: tokens.colors.success, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {mostEfficient.displayName}
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: tokens.colors.textMuted }}>
            {mostEfficient.efficiency}% efficiency
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Main Section
───────────────────────────────────────── */
export function CloudCostSection() {
  const { theme, toggleTheme }                       = useTheme();
  const { data, isLoading, isError, error, refetch } = useCloudData();

  const [timeRange,      setTimeRange]      = useState<TimeRange>('30d');
  const [breadcrumbs,    setBreadcrumbs]    = useState<BreadcrumbEntry[]>([]);
  const [drillPath,      setDrillPath]      = useState<string[]>([]);
  const [selectedId,     setSelectedId]     = useState<string | null>(null);
  const [drillDirection, setDrillDirection] = useState<'down' | 'up'>('down');

  const sectionRef = useRef<HTMLElement>(null);
  const isInView   = useInView(sectionRef, { once: true, margin: '-80px' });

  /* ── Scale ALL raw data by the time multiplier ── */
  const scaledData = useMemo(() => {
    if (!data) return [];
    return scaleHierarchy(data, TIME_MULTIPLIERS[timeRange]);
  }, [data, timeRange]);

  /* ── Resolve displayed items by following the drill path ── */
  const displayedItems = useMemo(() => {
    if (drillPath.length === 0) return scaledData;
    let current: HierarchyNode[] = scaledData;
    for (const id of drillPath) {
      const found = current.find((n) => n.id === id);
      if (!found) return current;
      current = found.children;
    }
    return current;
  }, [scaledData, drillPath]);

  const currentLevel: DrillLevel = getLevelFromDepth(breadcrumbs.length);
  const hasDrillDown             = currentLevel !== 'pod';

  /* ── Drill into a node ── */
  const handleDrillDown = useCallback(
    (item: HierarchyNode) => {
      if (item.children.length === 0) return;
      setDrillDirection('down');
      setBreadcrumbs((prev) => [
        ...prev,
        { id: item.id, name: item.displayName, level: currentLevel },
      ]);
      setDrillPath((prev) => [...prev, item.id]);
      setSelectedId(null);
    },
    [currentLevel],
  );

  /* ── Navigate back via breadcrumb ── */
  const handleNavigate = useCallback(
    (index: number) => {
      setDrillDirection('up');
      setBreadcrumbs((prev) => prev.slice(0, index));
      setDrillPath((prev) => prev.slice(0, index));
      setSelectedId(null);
    },
    [],
  );

  /* ── Time range change — reset drill state ── */
  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setTimeRange(range);
    setBreadcrumbs([]);
    setDrillPath([]);
    setSelectedId(null);
  }, []);

  /* ── Slide variants ── */
  const slideVariants = {
    enter: (direction: 'down' | 'up') => ({
      x:       direction === 'down' ? 24 : -24,
      opacity: 0,
      scale:   0.99,
    }),
    center: {
      x:       0,
      opacity: 1,
      scale:   1,
      transition: {
        x:       { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale:   { duration: 0.3 },
      },
    },
    exit: (direction: 'down' | 'up') => ({
      x:       direction === 'down' ? -24 : 24,
      opacity: 0,
      scale:   0.99,
      transition: {
        x:       { duration: 0.18, ease: 'easeIn' },
        opacity: { duration: 0.15 },
        scale:   { duration: 0.18 },
      },
    }),
  };

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
              fontSize:  'var(--font-size-sm)',
              color:     tokens.colors.textMuted,
              marginTop: '4px',
            }}
          >
            Drill into clusters, namespaces, and pods to understand your spend.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TimeFilter value={timeRange} onChange={handleTimeRangeChange} />
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
          {/* Card header */}
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

          {/* KPI summary */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`summary-${currentLevel}-${timeRange}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <SummaryBar items={displayedItems} />
            </motion.div>
          </AnimatePresence>

          {/* Savings callout — only renders when low-efficiency nodes exist */}
          <AnimatePresence mode="wait">
            <motion.div key={`savings-${currentLevel}-${timeRange}`}>
              <SavingsCallout items={displayedItems} />
            </motion.div>
          </AnimatePresence>

          <hr style={{ border: 'none', borderTop: `1px solid ${tokens.colors.border}` }} />

          {/* Bar chart */}
          <AnimatePresence mode="wait" custom={drillDirection}>
            <motion.div
              key={`chart-${currentLevel}-${timeRange}`}
              custom={drillDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <BarChart
                items={displayedItems}
                selectedId={selectedId}
                isActive={isInView}
                hasDrillDown={hasDrillDown}
                onSelect={setSelectedId}
                onDrillDown={handleDrillDown}
              />
            </motion.div>
          </AnimatePresence>

          <hr style={{ border: 'none', borderTop: `1px solid ${tokens.colors.border}` }} />

          {/* Cost table — staggered 60ms behind chart */}
          <AnimatePresence mode="wait" custom={drillDirection}>
            <motion.div
              key={`table-${currentLevel}-${timeRange}`}
              custom={drillDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ delay: 0.06 }}
            >
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
            </motion.div>
          </AnimatePresence>

          {/* Fix #8 — Pod level state replaces the old italic hint */}
          <AnimatePresence>
            {currentLevel === 'pod' && (
              <PodLevelState items={displayedItems} />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}