'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCloudHierarchy } from '@/lib/dataTransform';
import type { HierarchyNode, TimeRange } from '@/types';

/* ─────────────────────────────────────────
   Single source of truth for time multipliers
   Used in CloudCostSection to scale the hierarchy
───────────────────────────────────────── */
export const TIME_MULTIPLIERS: Record<TimeRange, number> = {
  '7d':  0.23,
  '30d': 1,
  '90d': 3.1,
};

/* ─────────────────────────────────────────
   React Query hook
   - staleTime 5 min  → no re-fetch on navigation
   - gcTime   10 min  → cached after unmount
   - retry 2×         → handles transient API failures
───────────────────────────────────────── */
export function useCloudData() {
  return useQuery<HierarchyNode[], Error>({
    queryKey:   ['cloud-hierarchy'],
    queryFn:    fetchCloudHierarchy,
    staleTime:  5 * 60 * 1000,
    gcTime:     10 * 60 * 1000,
    retry:      2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });
}