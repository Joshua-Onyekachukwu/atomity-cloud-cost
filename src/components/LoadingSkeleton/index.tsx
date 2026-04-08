'use client';

import { tokens } from '@/tokens';

function SkeletonBlock({ width = '100%', height = '20px', radius = tokens.radius.sm }: {
  width?:  string;
  height?: string;
  radius?: string;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius:    radius,
        backgroundColor: tokens.colors.bgSubtle,
        backgroundImage: `linear-gradient(
          90deg,
          transparent 0%,
          color-mix(in srgb, var(--color-accent-primary) 8%, transparent) 50%,
          transparent 100%
        )`,
        backgroundSize:   '200% 100%',
        animation:        'shimmer 1.6s ease-in-out infinite',
      }}
    />
  );
}

export function LoadingSkeleton() {
  return (
    <section
      aria-label="Loading cost data"
      aria-busy="true"
      style={{
        backgroundColor: tokens.colors.bgCard,
        borderRadius:    tokens.radius.xl,
        padding:         'clamp(24px, 4vw, 40px)',
        boxShadow:       tokens.shadow.md,
        display:         'flex',
        flexDirection:   'column',
        gap:             '32px',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <SkeletonBlock width="120px" height="36px" radius={tokens.radius.full} />
        <SkeletonBlock width="180px" height="36px" radius={tokens.radius.full} />
      </div>

      {/* Bar chart area */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', height: '220px' }}>
        {[75, 58, 42, 25].map((pct, i) => (
          <div
            key={i}
            style={{
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           '8px',
              flex:          1,
            }}
          >
            <SkeletonBlock
              width="100%"
              height={`${pct}%`}
              radius={tokens.radius.sm}
            />
            <SkeletonBlock width="80%" height="14px" radius={tokens.radius.full} />
          </div>
        ))}
      </div>

      {/* Table rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Header */}
        <div style={{ display: 'flex', gap: '16px', paddingBlock: '8px' }}>
          {[1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5].map((flex, i) => (
            <SkeletonBlock key={i} width={`${flex * 80}px`} height="12px" radius={tokens.radius.full} />
          ))}
        </div>
        {/* 4 data rows */}
        {[0, 1, 2, 3].map((row) => (
          <div
            key={row}
            style={{
              display:     'flex',
              gap:         '16px',
              alignItems:  'center',
              paddingBlock:'14px',
              borderBottom:`1px solid ${tokens.colors.borderSubtle}`,
            }}
          >
            <SkeletonBlock width="120px" height="16px" radius={tokens.radius.full} />
            {[1, 2, 3, 4, 5, 6].map((col) => (
              <SkeletonBlock key={col} width="60px" height="14px" radius={tokens.radius.full} />
            ))}
          </div>
        ))}
      </div>

      {/* Shimmer keyframe injected inline */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </section>
  );
}