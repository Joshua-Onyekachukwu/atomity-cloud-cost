'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { tokens, RESOURCE_KEYS, RESOURCE_COLOR_VARS, RESOURCE_LABELS } from '@/tokens';
import type { HierarchyNode } from '@/types';

interface TooltipProps {
  item:    HierarchyNode;
  visible: boolean;
}

function formatCurrency(n: number): string {
  return `$${n.toLocaleString()}`;
}

export function Tooltip({ item, visible }: TooltipProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="tooltip"
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.96 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{
            position:        'absolute',
            bottom:          'calc(100% + 12px)',
            left:            '50%',
            transform:       'translateX(-50%)',
            zIndex:          50,
            backgroundColor: tokens.colors.bgSecondary,
            border:          `1px solid ${tokens.colors.border}`,
            borderRadius:    tokens.radius.md,
            boxShadow:       tokens.shadow.lg,
            padding:         '12px 14px',
            minWidth:        '180px',
            pointerEvents:   'none',
          }}
        >
          {/* Node name header */}
          <p
            style={{
              fontSize:     'var(--font-size-xs)',
              fontWeight:   700,
              color:        tokens.colors.textPrimary,
              marginBottom: '10px',
              whiteSpace:   'nowrap',
              overflow:     'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.displayName}
          </p>

          {/* Resource rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {RESOURCE_KEYS.map((key) => {
              const value = item.breakdown[key];
              if (value === 0) return null;
              const pct = Math.round((value / item.total) * 100);

              return (
                <div
                  key={key}
                  style={{
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'space-between',
                    gap:            '12px',
                  }}
                >
                  {/* Dot + label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      aria-hidden="true"
                      style={{
                        width:           '8px',
                        height:          '8px',
                        borderRadius:    tokens.radius.xs,
                        backgroundColor: RESOURCE_COLOR_VARS[key],
                        flexShrink:      0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        color:    tokens.colors.textMuted,
                      }}
                    >
                      {RESOURCE_LABELS[key]}
                    </span>
                  </div>

                  {/* Value + percentage */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize:           'var(--font-size-xs)',
                        fontWeight:         600,
                        color:              tokens.colors.textPrimary,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatCurrency(value)}
                    </span>
                    <span
                      style={{
                        fontSize:        'var(--font-size-xs)',
                        color:           tokens.colors.textMuted,
                        backgroundColor: tokens.colors.bgSubtle,
                        borderRadius:    tokens.radius.full,
                        paddingInline:   '5px',
                        paddingBlock:    '1px',
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div
            style={{
              borderTop:   `1px solid ${tokens.colors.border}`,
              marginBlock: '10px',
            }}
          />

          {/* Total row */}
          <div
            style={{
              display:        'flex',
              justifyContent: 'space-between',
              alignItems:     'center',
            }}
          >
            <span
              style={{
                fontSize:  'var(--font-size-xs)',
                fontWeight: 600,
                color:     tokens.colors.textMuted,
              }}
            >
              Total
            </span>
            <span
              style={{
                fontSize:           'var(--font-size-xs)',
                fontWeight:         700,
                color:              tokens.colors.accentPrimary,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatCurrency(item.total)}
            </span>
          </div>

          {/* Efficiency row */}
          <div
            style={{
              display:        'flex',
              justifyContent: 'space-between',
              alignItems:     'center',
              marginTop:      '4px',
            }}
          >
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                color:    tokens.colors.textMuted,
              }}
            >
              Efficiency
            </span>
            <span
              style={{
                fontSize:  'var(--font-size-xs)',
                fontWeight: 600,
                color:     item.efficiency >= 50
                  ? tokens.colors.success
                  : item.efficiency >= 25
                  ? tokens.colors.warning
                  : tokens.colors.error,
              }}
            >
              {item.efficiency}%
            </span>
          </div>

          {/* Arrow pointing down */}
          <div
            aria-hidden="true"
            style={{
              position:    'absolute',
              bottom:      '-5px',
              left:        '50%',
              transform:   'translateX(-50%) rotate(45deg)',
              width:       '8px',
              height:      '8px',
              backgroundColor: tokens.colors.bgSecondary,
              borderRight: `1px solid ${tokens.colors.border}`,
              borderBottom:`1px solid ${tokens.colors.border}`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}