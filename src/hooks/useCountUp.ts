import { useEffect, useRef, useState } from 'react';

interface CountUpOptions {
  /** Final value to count towards. */
  to: number;
  /** Duration in milliseconds. */
  duration?: number;
  /** Start counting only once the element is in view. */
  enabled?: boolean;
  /** Decimal places to keep while animating. */
  decimals?: number;
}

/**
 * Animate a number from 0 to `to` using an ease-out curve.
 * Returns the current value plus a callback ref to attach to a node so the
 * animation only begins once the element is scrolled into view.
 */
export function useCountUp({ to, duration = 1800, enabled = true, decimals = 0 }: CountUpOptions) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const run = () => {
      if (started.current) return;
      started.current = true;

      if (prefersReduced) {
        setValue(to);
        return;
      }

      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const next = to * eased;
        setValue(Number(next.toFixed(decimals)));
        if (progress < 1) requestAnimationFrame(tick);
        else setValue(to);
      };
      requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === 'undefined') {
      run();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [to, duration, enabled, decimals]);

  return { ref, value };
}