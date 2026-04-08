'use client';

import { tokens } from '@/tokens';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Failed to load cost data.',
  onRetry,
}: ErrorStateProps) {
  return (
    <section
      role="alert"
      aria-live="assertive"
      style={{
        backgroundColor: tokens.colors.bgCard,
        borderRadius:    tokens.radius.xl,
        padding:         'clamp(40px, 6vw, 64px)',
        boxShadow:       tokens.shadow.md,
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        gap:             '16px',
        textAlign:       'center',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width:           '56px',
          height:          '56px',
          borderRadius:    tokens.radius.full,
          backgroundColor: tokens.colors.errorBg,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          color:           tokens.colors.error,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      {/* Text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h2
          style={{
            fontSize:   'var(--font-size-lg)',
            fontWeight: 600,
            color:      tokens.colors.textPrimary,
          }}
        >
          Something went wrong
        </h2>
        <p style={{ fontSize: 'var(--font-size-sm)', color: tokens.colors.textMuted }}>
          {message}
        </p>
      </div>

      {/* Retry */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="focus-ring"
          style={{
            marginTop:       '8px',
            paddingInline:   '24px',
            paddingBlock:    '10px',
            borderRadius:    tokens.radius.full,
            border:          'none',
            cursor:          'pointer',
            fontSize:        'var(--font-size-sm)',
            fontWeight:      600,
            backgroundColor: tokens.colors.accentPrimary,
            color:           tokens.colors.textInverse,
            transition:      `opacity ${tokens.transition.fast}`,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Try again
        </button>
      )}
    </section>
  );
}