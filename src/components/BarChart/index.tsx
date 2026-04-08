'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  tokens,
  RESOURCE_KEYS,
  RESOURCE_COLOR_VARS,
  RESOURCE_LABELS,
} from '@/tokens';
import { BarColumn } from './BarColumn';
import type { HierarchyNode } from '@/types';

interface BarChartProps {
  items: HierarchyNode[];
  selectedId: string | null;
  isActive: boolean;
  hasDrillDown: boolean;
  onSelect: (id: string) => void;
  onDrillDown: (item: HierarchyNode) => void;
}

export function BarChart({
  items,
  selectedId,
  isActive,
  hasDrillDown,
  onSelect,
  onDrillDown,
}: BarChartProps) {
  const maxTotal = Math.max(...items.map((i) => i.total));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

      {/* Legend */}
      <div
        role="list"
        aria-label="Resource cost legend"
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {RESOURCE_KEYS.map((key) => (
          <div
            key={key}
            role="listitem"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: '10px',
                height: '10px',
                borderRadius: tokens.radius.xs,
                backgroundColor: RESOURCE_COLOR_VARS[key],
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 500,
                color: tokens.colors.textMuted,
              }}
            >
              {RESOURCE_LABELS[key]}
            </span>
          </div>
        ))}

        {hasDrillDown && (
          <span
            style={{
              marginInlineStart: 'auto',
              fontSize: 'var(--font-size-xs)',
              color: tokens.colors.textMuted,
              fontStyle: 'italic',
            }}
          >
            Click a bar to drill in →
          </span>
        )}
      </div>

      {/* Chart */}
      <AnimatePresence mode="wait">
        <motion.div
          key={items.map((i) => i.id).join('-')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            height: 'var(--bar-max-height, 200px)',
            boxSizing: 'border-box', // ✅ keeps total height exactly --bar-max-height
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Label safe zone — bars cannot grow into this space */}
          <div style={{ height: '36px', flexShrink: 0 }} />

          {/* Actual bar area — takes remaining height */}
          <div
            className="bar-chart-area"
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '16px',
              flex: 1,
              position: 'relative',
              overflow: 'visible',
            }}
          >
            {/* Grid lines */}
            {[25, 50, 75, 100].map((pct) => (
              <div
                key={pct}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  insetInline: 0,
                  bottom: `${pct}%`,
                  borderTop: `1px dashed ${tokens.colors.borderSubtle}`,
                  pointerEvents: 'none',
                }}
              />
            ))}

            {/* Bars */}
            {items.map((item, i) => (
              <BarColumn
                key={item.id}
                item={item}
                maxTotal={maxTotal}
                index={i}
                isSelected={selectedId === item.id}
                isActive={isActive}
                hasDrillDown={hasDrillDown}
                onSelect={onSelect}
                onDrillDown={onDrillDown}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}