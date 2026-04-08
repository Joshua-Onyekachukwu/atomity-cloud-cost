'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCloudHierarchy } from '@/lib/dataTransform';
import type { HierarchyNode } from '@/types';

/**
 * Fetches the cloud cost hierarchy and caches it with React Query.
 * - staleTime 5 min  → no re-fetch on navigation within 5 minutes
 * - gcTime   10 min  → data stays in memory for 10 minutes after unmount
 */
export function useCloudData() {
  return useQuery<HierarchyNode[], Error>({
    queryKey: ['cloud-hierarchy'],
    queryFn:  fetchCloudHierarchy,
    staleTime: 5 * 60 * 1000,
    gcTime:   10 * 60 * 1000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });
}