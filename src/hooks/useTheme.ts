'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

/**
 * Reads/writes the data-theme attribute on <html>.
 * Persists preference to localStorage.
 * Falls back to the OS preference on first visit.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  // On mount: check localStorage first, then OS preference
  useEffect(() => {
    const stored = localStorage.getItem('atomity-theme') as Theme | null;
    if (stored) {
      apply(stored);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      apply('dark');
    }
  }, []);

  function apply(next: Theme) {
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  }

  function toggleTheme() {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    apply(next);
    localStorage.setItem('atomity-theme', next);
  }

  return { theme, toggleTheme };
}