import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary':    'var(--color-bg-primary)',
        'bg-secondary':  'var(--color-bg-secondary)',
        'bg-card':       'var(--color-bg-card)',
        'bg-subtle':     'var(--color-bg-subtle)',
        'bg-hover':      'var(--color-bg-hover)',
        'text-primary':  'var(--color-text-primary)',
        'text-secondary':'var(--color-text-secondary)',
        'text-muted':    'var(--color-text-muted)',
        'text-inverse':  'var(--color-text-inverse)',
        'accent':        'var(--color-accent-primary)',
        'accent-bright': 'var(--color-accent-bright)',
        'border-token':  'var(--color-border)',
        'success':       'var(--color-success)',
        'warning':       'var(--color-warning)',
        'danger':        'var(--color-error)',
      },
      borderRadius: {
        'token-xs': 'var(--radius-xs)',
        'token-sm': 'var(--radius-sm)',
        'token-md': 'var(--radius-md)',
        'token-lg': 'var(--radius-lg)',
        'token-xl': 'var(--radius-xl)',
      },
      boxShadow: {
        'token-sm':  'var(--shadow-sm)',
        'token-md':  'var(--shadow-md)',
        'token-lg':  'var(--shadow-lg)',
        'token-glow':'var(--shadow-glow)',
      },
    },
  },
  plugins: [],
};

export default config;