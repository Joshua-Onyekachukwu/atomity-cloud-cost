'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { tokens, RESOURCE_KEYS, RESOURCE_COLOR_VARS } from '@/tokens';
import { useCountUp } from '@/hooks/useCountUp';
import { Tooltip } from '@/components/Tooltip';
import type { HierarchyNode } from '@/types';

interface BarColumnProps {
  item:         HierarchyNode;
  maxTotal:     number;
  index:        number;
  isSelected:   boolean;
  isActive:     boolean;
  onSelect:     (id: string) => void;
  onDrillDown:  (item: HierarchyNode) => void;
  hasDrillDown: boolean;
}

function formatCurrency(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n}`;
}

export function BarColumn({
  item,
  maxTotal,
  index,
  isSelected,
  isActive,
  onSelect,
  onDrillDown,
  hasDrillDown,
}: BarColumnProps) {
  const [hovered, setHovered]   = useState(false);
  const heightPct               = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;
  const animatedTotal           = useCountUp(item.total, 1000, index * 80, isActive);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay:    index * 0.08,
        ease:     [0.22, 1, 0.36, 1],
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:           '10px',
        flex:          1,
        cursor:        hasDrillDown ? 'pointer' : 'default',
      }}
      onClick={() => {
        onSelect(item.id);
        if (hasDrillDown) onDrillDown(item);
      }}
      role={hasDrillDown ? 'button' : undefined}
      aria-label={hasDrillDown ? `Drill into ${item.displayName}` : item.displayName}
      tabIndex={hasDrillDown ? 0 : undefined}
      onKeyDown={(e) => {
        if (hasDrillDown && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onDrillDown(item);
        }
      }}
    >
      {/* Bar wrapper */}
      <div
        className="bar-column-wrapper"
        style={{
          width:          'var(--bar-width, 90px)',
          height:         'var(--bar-max-height, 200px)',
          display:        'flex',
          flexDirection:  'column',
          justifyContent: 'flex-end',
          position:       'relative',
        }}
      >
        {/* Tooltip — appears on hover */}
        <Tooltip item={item} visible={hovered} />

        {/* Price label — floats above the bar */}
        <motion.span
          animate={{ opacity: isSelected ? 1 : 0.7 }}
          style={{
            position:           'absolute',
            top:                '-24px',
            left:               '50%',
            transform:          'translateX(-50%)',
            fontSize:           'var(--font-size-xs)',
            fontWeight:         700,
            color:              tokens.colors.accentPrimary,
            fontVariantNumeric: 'tabular-nums',
            whiteSpace:         'nowrap',
          }}
        >
          {formatCurrency(animatedTotal)}
        </motion.span>

        {/* Stacked bar */}
        <motion.div
          animate={{
            boxShadow: isSelected
              ? `0 0 0 2px ${tokens.colors.accentPrimary}, ${tokens.shadow.glow}`
              : '0 0 0 0px transparent',
            scale: isSelected ? 1.03 : 1,
          }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          style={{
            width:         '100%',
            height:        `${heightPct}%`,
            borderRadius:  `${tokens.radius.sm} ${tokens.radius.sm} ${tokens.radius.xs} ${tokens.radius.xs}`,
            overflow:      'hidden',
            display:       'flex',
            flexDirection: 'column-reverse',
            minHeight:     '8px',
          }}
        >
          {RESOURCE_KEYS.map((key, si) => {
            const segmentValue = item.breakdown[key];
            const segmentPct   = item.total > 0 ? (segmentValue / item.total) * 100 : 0;
            if (segmentPct === 0) return null;

            return (
              <motion.div
                key={key}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{
                  duration: 0.55,
                  delay:    index * 0.08 + si * 0.06,
                  ease:     [0.22, 1, 0.36, 1],
                }}
                style={{
                  width:           '100%',
                  height:          `${segmentPct}%`,
                  backgroundColor: RESOURCE_COLOR_VARS[key],
                  transformOrigin: 'bottom',
                  minHeight:       '3px',
                  filter:          hovered || isSelected
                    ? 'brightness(1.1)'
                    : 'brightness(1)',
                  transition: `filter ${tokens.transition.fast}`,
                }}
              />
            );
          })}
        </motion.div>
      </div>

      {/* Name label below bar */}
      <span
        className="bar-label-name"
        style={{
          fontSize:     'var(--font-size-xs)',
          fontWeight:   isSelected ? 700 : 500,
          color:        isSelected
            ? tokens.colors.textPrimary
            : tokens.colors.textSecondary,
          textAlign:    'center',
          maxWidth:     'var(--bar-width, 90px)',
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          whiteSpace:   'nowrap',
          transition:   `color ${tokens.transition.fast}`,
        }}
      >
        {item.displayName}
      </span>
    </motion.div>
  );
}