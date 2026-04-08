'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { tokens, RESOURCE_LABELS, RESOURCE_KEYS } from '@/tokens';
import { TableRow } from './TableRow';
import type { HierarchyNode } from '@/types';

interface CostTableProps {
  items:      HierarchyNode[];
  selectedId: string | null;
  isActive:   boolean;
  onSelect:   (id: string) => void;
}

export function CostTable({ items, selectedId, isActive, onSelect }: CostTableProps) {
  return (
    <div
      style={{
        overflowX:    'auto',
        borderRadius: tokens.radius.md,
        border:       `1px solid ${tokens.colors.border}`,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.table
          key={items.map((i) => i.id).join('-')}
          className="cost-table"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          aria-label="Cost breakdown table"
        >
          <thead>
            <tr>
              <th scope="col" style={{ textAlign: 'start' }}>Name</th>
              {RESOURCE_KEYS.map((key) => (
                <th key={key} scope="col">
                  {RESOURCE_LABELS[key]}
                </th>
              ))}
              <th scope="col">Efficiency</th>
              <th scope="col">Total</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, i) => (
              <TableRow
                key={item.id}
                item={item}
                index={i}
                isSelected={selectedId === item.id}
                isActive={isActive}
                onClick={() => onSelect(item.id)}
              />
            ))}
          </tbody>
        </motion.table>
      </AnimatePresence>
    </div>
  );
}