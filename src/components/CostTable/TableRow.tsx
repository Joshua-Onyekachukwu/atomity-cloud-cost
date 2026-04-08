'use client';

import { motion } from 'framer-motion';
import { tokens, RESOURCE_KEYS } from '@/tokens';
import { Badge } from '@/components/Badge';
import { useCountUp } from '@/hooks/useCountUp';
import type { HierarchyNode } from '@/types';

interface TableRowProps {
  item:       HierarchyNode;
  index:      number;
  isSelected: boolean;
  isActive:   boolean;
  onClick:    () => void;
}

function formatCurrency(n: number): string {
  return `$${n.toLocaleString()}`;
}

function getEfficiencyVariant(efficiency: number): {
  variant: 'success' | 'warning' | 'error';
  semanticClass: string;
} {
  if (efficiency >= 50) return { variant: 'success', semanticClass: '' };
  if (efficiency >= 25) return { variant: 'warning', semanticClass: 'efficiency-warning' };
  return { variant: 'error', semanticClass: 'efficiency-critical' };
}

export function TableRow({ item, index, isSelected, isActive, onClick }: TableRowProps) {
  const animatedTotal = useCountUp(item.total, 900, index * 60, isActive);
  const { variant, semanticClass } = getEfficiencyVariant(item.efficiency);

  return (
    <motion.tr
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.35,
        delay:    index * 0.06,
        ease:     [0.22, 1, 0.36, 1],
      }}
      onClick={onClick}
      style={{
        cursor:          'pointer',
        backgroundColor: isSelected
          ? tokens.colors.accentDim
          : 'transparent',
        outline: isSelected
          ? `1px solid ${tokens.colors.accentPrimary}`
          : 'none',
        outlineOffset: '-1px',
        transition:    `background-color ${tokens.transition.fast}`,
      }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-selected={isSelected}
    >
      {/* Name */}
      <td>
        <span style={{ fontWeight: 600, color: tokens.colors.textPrimary }}>
          {item.displayName}
        </span>
      </td>

      {/* Resource costs */}
      {RESOURCE_KEYS.map((key) => (
        <td key={key} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatCurrency(item.breakdown[key])}
        </td>
      ))}

      {/* Efficiency badge — triggers :has() CSS on the row */}
      <td>
        <Badge variant={variant} semanticClass={semanticClass}>
          {item.efficiency}%
        </Badge>
      </td>

      {/* Animated total */}
      <td
        style={{
          fontWeight:         700,
          color:              tokens.colors.textPrimary,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {formatCurrency(animatedTotal)}
      </td>
    </motion.tr>
  );
}