import { useEffect, useRef } from 'react';

interface ParallaxOptions {
  /** How far to travel, as a fraction of the viewport. 0.2 = subtle, 0.8 = dramatic. */
  speed?: number;
  /** Direction of travel. */
  axis?: 'x' | 'y';
  /** Scale applied across the scroll range (negative shrinks as it rises). */
  scale?: number;
  /** Degrees of rotation across the scroll range. */
  rotate?: number;
  /** Fade toward the edges of the viewport instead of staying fully opaque. */
  fade?: boolean;
}

/**
 * Applies a scroll-driven transform to an element imperatively.
 *
 * Uses a passive scroll listener plus a single batched `requestAnimationFrame`,
 * so the transform is written straight to the node's style without triggering a
 * React re-render. Fully disabled under `prefers-reduced-motion`.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>({
  speed = 0.2,
  axis = 'y',
  scale = 0,
  rotate = 0,
  fade = false,
}: ParallaxOptions = {}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;

    const apply = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // -1 when the element sits a full viewport below centre, +1 when above.
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;

      const shift = progress * speed * 100;
      const translate =
        axis === 'y'
          ? `translate3d(0, ${(-shift).toFixed(2)}px, 0)`
          : `translate3d(${shift.toFixed(2)}px, 0, 0)`;

      const parts = [translate];
      if (scale) parts.push(`scale(${(1 + progress * scale).toFixed(4)})`);
      if (rotate) parts.push(`rotate(${(progress * rotate).toFixed(3)}deg)`);
      el.style.transform = parts.join(' ');

      if (fade) {
        el.style.opacity = String(Math.max(0, Math.min(1, 1 - Math.abs(progress) * 0.9)));
      }
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
  }, [speed, axis, scale, rotate, fade]);

  return ref;
}