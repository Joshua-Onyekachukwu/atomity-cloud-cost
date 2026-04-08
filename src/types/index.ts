import type { ResourceKey } from '@/tokens';

/** The three drill levels */
export type DrillLevel = 'cluster' | 'namespace' | 'pod';

/** Time range options */
export type TimeRange = '7d' | '30d' | '90d';

/** Cost split across the five resource types */
export interface CostBreakdown {
  cpu:     number;
  ram:     number;
  storage: number;
  network: number;
  gpu:     number;
}

/** A single row in the table / bar in the chart */
export interface CostItem {
  id:          string;
  name:        string;
  displayName: string;
  breakdown:   CostBreakdown;
  /** Efficiency score 0–100. Low = wasted spend. */
  efficiency:  number;
  total:       number;
}

/** Same as CostItem but with drillable children */
export interface HierarchyNode extends CostItem {
  children: HierarchyNode[];
}

/** One entry in the breadcrumb trail */
export interface BreadcrumbEntry {
  id:          string;
  name:        string;
  level:       DrillLevel;
}

/** Shape used by the chart legend */
export interface LegendItem {
  key:      ResourceKey;
  label:    string;
  colorVar: string;
}