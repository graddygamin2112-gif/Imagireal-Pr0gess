import { useEffect, useRef, useState } from 'react';

/**
 * Reports how far an element has travelled through the viewport as a 0..1 value.
 *
 * - `0` → the element's top edge is at the bottom of the viewport (just entering)
 * - `1` → the element's bottom edge has reached the top of the viewport (fully past)
 *
 * Updates are batched into a single `requestAnimationFrame` on scroll.
 */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;

    const apply = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const total = rect.height + vh;
      const travelled = vh - rect.top;
      setProgress(Math.max(0, Math.min(1, travelled / total)));
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return { ref, progress };
}