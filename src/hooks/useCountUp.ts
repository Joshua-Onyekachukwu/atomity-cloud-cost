'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from 0 → target using ease-out cubic.
 * Respects prefers-reduced-motion by snapping to target immediately.
 *
 * @param target   - the final number to count to
 * @param duration - animation length in ms (default 1100)
 * @param delay    - delay before starting in ms (default 0)
 * @param active   - set false to reset back to 0
 */
export function useCountUp(
  target:   number,
  duration: number = 1100,
  delay:    number = 0,
  active:   boolean = true,
): number {
  const [value, setValue]   = useState(0);
  const frameRef            = useRef<number | undefined>(undefined);
  const timeoutRef          = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!active) {
      setValue(0);
      return;
    }

    if (prefersReduced) {
      setValue(target);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed  = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased    = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(target * eased));

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(tick);
        }
      };

      frameRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeoutRef.current);
      if (frameRef.current !== undefined) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, duration, delay, active]);

  return value;
}