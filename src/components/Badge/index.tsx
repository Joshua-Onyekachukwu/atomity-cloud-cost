'use client';

import { tokens } from '@/tokens';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'accent';

interface BadgeProps {
  children:      React.ReactNode;
  variant?:      BadgeVariant;
  /** Passed through to DOM so CSS :has() selectors can target it */
  semanticClass?: string;
  className?:    string;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; color: string }> = {
  default: { bg: tokens.colors.bgSubtle,   color: tokens.colors.textSecondary },
  success: { bg: tokens.colors.successBg,  color: tokens.colors.success       },
  warning: { bg: tokens.colors.warningBg,  color: tokens.colors.warning       },
  error:   { bg: tokens.colors.errorBg,    color: tokens.colors.error         },
  accent:  { bg: tokens.colors.accentDim,  color: tokens.colors.accentPrimary },
};

export function Badge({
  children,
  variant = 'default',
  semanticClass = '',
  className = '',
}: BadgeProps) {
  const { bg, color } = VARIANT_STYLES[variant];

  return (
    <span
      className={`${semanticClass} ${className}`.trim()}
      style={{
        display:         'inline-flex',
        alignItems:      'center',
        gap:             '4px',
        fontSize:        'var(--font-size-xs)',
        fontWeight:      600,
        lineHeight:      1,
        paddingInline:   '8px',
        paddingBlock:    '4px',
        borderRadius:    tokens.radius.full,
        backgroundColor: bg,
        color,
      }}
    >
      {children}
    </span>
  );
}