/**
 * Design tokens — typed JS references to every CSS variable defined in globals.css.
 * Import from here in components. Never write a raw hex value in a component file.
 */

export const tokens = {
  colors: {
    bgPrimary:   'var(--color-bg-primary)',
    bgSecondary: 'var(--color-bg-secondary)',
    bgCard:      'var(--color-bg-card)',
    bgSubtle:    'var(--color-bg-subtle)',
    bgHover:     'var(--color-bg-hover)',

    textPrimary:   'var(--color-text-primary)',
    textSecondary: 'var(--color-text-secondary)',
    textMuted:     'var(--color-text-muted)',
    textInverse:   'var(--color-text-inverse)',

    accentPrimary: 'var(--color-accent-primary)',
    accentBright:  'var(--color-accent-bright)',
    accentGlow:    'var(--color-accent-glow)',
    accentDim:     'var(--color-accent-dim)',

    cpu:     'var(--color-cpu)',
    ram:     'var(--color-ram)',
    storage: 'var(--color-storage)',
    network: 'var(--color-network)',
    gpu:     'var(--color-gpu)',

    success:   'var(--color-success)',
    warning:   'var(--color-warning)',
    error:     'var(--color-error)',
    successBg: 'var(--color-success-bg)',
    warningBg: 'var(--color-warning-bg)',
    errorBg:   'var(--color-error-bg)',

    border:       'var(--color-border)',
    borderSubtle: 'var(--color-border-subtle)',
  },

  radius: {
    xs:   'var(--radius-xs)',
    sm:   'var(--radius-sm)',
    md:   'var(--radius-md)',
    lg:   'var(--radius-lg)',
    xl:   'var(--radius-xl)',
    full: 'var(--radius-full)',
  },

  shadow: {
    xs:   'var(--shadow-xs)',
    sm:   'var(--shadow-sm)',
    md:   'var(--shadow-md)',
    lg:   'var(--shadow-lg)',
    glow: 'var(--shadow-glow)',
  },

  transition: {
    fast: 'var(--transition-fast)',
    base: 'var(--transition-base)',
    slow: 'var(--transition-slow)',
  },
} as const;

/** The five resource types we track cost for */
export const RESOURCE_KEYS = ['cpu', 'ram', 'storage', 'network', 'gpu'] as const;
export type ResourceKey = (typeof RESOURCE_KEYS)[number];

/** Human-readable column headers */
export const RESOURCE_LABELS: Record<ResourceKey, string> = {
  cpu:     'CPU',
  ram:     'RAM',
  storage: 'Storage',
  network: 'Network',
  gpu:     'GPU',
};

/** Maps each resource to its CSS variable colour */
export const RESOURCE_COLOR_VARS: Record<ResourceKey, string> = {
  cpu:     'var(--color-cpu)',
  ram:     'var(--color-ram)',
  storage: 'var(--color-storage)',
  network: 'var(--color-network)',
  gpu:     'var(--color-gpu)',
};