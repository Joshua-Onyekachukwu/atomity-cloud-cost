'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '@/tokens';
import type { BreadcrumbEntry, DrillLevel } from '@/types';

interface BreadcrumbProps {
  entries:      BreadcrumbEntry[];
  currentLevel: DrillLevel;
  onNavigate:   (index: number) => void;
}

const LEVEL_LABEL: Record<DrillLevel, string> = {
  cluster:   'Cluster',
  namespace: 'Namespace',
  pod:       'Pod',
};

const AGGREGATED_BY: Record<DrillLevel, string> = {
  cluster:   'Cluster',
  namespace: 'Namespace',
  pod:       'Pod',
};

export function Breadcrumb({ entries, currentLevel, onNavigate }: BreadcrumbProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>

      {/* Drill path */}
      <nav
        aria-label="Cost drill-down path"
        style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}
      >
        {/* Root crumb — always visible */}
        <button
          onClick={() => onNavigate(0)}
          className="focus-ring"
          aria-current={entries.length === 0 ? 'page' : undefined}
          style={{
            display:    'inline-flex',
            alignItems: 'center',
            gap:        '5px',
            fontSize:   'var(--font-size-sm)',
            fontWeight: entries.length === 0 ? 700 : 400,
            color:      entries.length === 0
              ? tokens.colors.textPrimary
              : tokens.colors.textMuted,
            background:   'none',
            border:       'none',
            cursor:       entries.length > 0 ? 'pointer' : 'default',
            padding:      '2px 4px',
            borderRadius: tokens.radius.xs,
            transition:   `color ${tokens.transition.fast}`,
          }}
        >
          {/* Home icon */}
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 1.5 L14.5 8 H12.5 V14 H9.5 V10 H6.5 V14 H3.5 V8 H1.5 Z" />
          </svg>
          All Clusters
        </button>

        <AnimatePresence>
          {entries.map((entry, i) => (
            <motion.span
              key={entry.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              {/* Chevron */}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ color: tokens.colors.textMuted, flexShrink: 0 }}>
                <path d="M4 2.5L7.5 6L4 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              <button
                onClick={() => i < entries.length - 1 ? onNavigate(i + 1) : undefined}
                className="focus-ring"
                aria-current={i === entries.length - 1 ? 'page' : undefined}
                style={{
                  fontSize:    'var(--font-size-sm)',
                  fontWeight:  i === entries.length - 1 ? 700 : 400,
                  color:       i === entries.length - 1
                    ? tokens.colors.textPrimary
                    : tokens.colors.textMuted,
                  background:   'none',
                  border:       'none',
                  cursor:       i < entries.length - 1 ? 'pointer' : 'default',
                  padding:      '2px 4px',
                  borderRadius: tokens.radius.xs,
                  transition:   `color ${tokens.transition.fast}`,
                  maxWidth:     '180px',
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace:   'nowrap',
                }}
              >
                {entry.name}
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </nav>

      {/* Aggregated-by pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span
          style={{
            fontSize:        'var(--font-size-xs)',
            color:           tokens.colors.textMuted,
            fontStyle:       'italic',
          }}
        >
          Aggregated by:
        </span>
        <span
          style={{
            fontSize:        'var(--font-size-xs)',
            fontWeight:      700,
            color:           tokens.colors.accentPrimary,
            backgroundColor: tokens.colors.accentDim,
            borderRadius:    tokens.radius.full,
            paddingInline:   '8px',
            paddingBlock:    '3px',
          }}
        >
          {AGGREGATED_BY[currentLevel]}
        </span>
      </div>

    </div>
  );
}