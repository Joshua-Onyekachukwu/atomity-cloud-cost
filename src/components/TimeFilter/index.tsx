'use client';

import { tokens } from '@/tokens';
import type { TimeRange } from '@/types';

interface TimeFilterProps {
  value:    TimeRange;
  onChange: (range: TimeRange) => void;
}

const OPTIONS: { label: string; value: TimeRange }[] = [
  { label: 'Last 7D',  value: '7d'  },
  { label: 'Last 30D', value: '30d' },
  { label: 'Last 90D', value: '90d' },
];

export function TimeFilter({ value, onChange }: TimeFilterProps) {
  return (
    <div
      role="group"
      aria-label="Time range selector"
      style={{
        display:         'inline-flex',
        alignItems:      'center',
        backgroundColor: tokens.colors.bgSubtle,
        border:          `1px solid ${tokens.colors.border}`,
        borderRadius:    tokens.radius.full,
        padding:         '3px',
        gap:             '2px',
      }}
    >
      {OPTIONS.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            aria-pressed={isActive}
            className="focus-ring"
            style={{
              fontSize:        'var(--font-size-xs)',
              fontWeight:      600,
              paddingInline:   '14px',
              paddingBlock:    '6px',
              borderRadius:    tokens.radius.full,
              border:          'none',
              cursor:          'pointer',
              letterSpacing:   '0.04em',
              backgroundColor: isActive ? tokens.colors.accentPrimary : 'transparent',
              color:           isActive ? tokens.colors.textInverse    : tokens.colors.textMuted,
              transition:      `background-color ${tokens.transition.fast}, color ${tokens.transition.fast}`,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}