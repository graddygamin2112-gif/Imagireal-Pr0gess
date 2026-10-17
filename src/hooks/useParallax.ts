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
 * Walk the offsetParent chain to find an element's position in the document.
 *
 * Unlike `getBoundingClientRect()`, this uses `offsetTop`/`offsetLeft`, which
 * are pure layout values that ignore CSS transforms. That matters because this
 * hook transforms the very element it measures — if we measured the rendered
 * rect each frame, the element would chase its own transform and jitter.
 */
function documentOffset(el: HTMLElement): { x: number; y: number } {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

/**
 * Apply a scroll-driven transform to an element, imperatively.
 *
 * Progress is derived from the page scroll position and the element's
 * transform-independent layout offset — never from its own bounding rect — so
 * the effect stays stable regardless of the scale/rotation we apply. Updates
 * run off a passive scroll listener batched into one `requestAnimationFrame`,
 * and the whole effect no-ops under `prefers-reduced-motion`.
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

    let base = 0; // transform-independent position along the scroll axis
    let ticking = false;

    const measureBase = () => {
      const offset = documentOffset(el);
      base = axis === 'y' ? offset.y : offset.x;
    };

    const apply = () => {
      ticking = false;
      const viewport = (axis === 'y' ? window.innerHeight : window.innerWidth) || 1;
      const scroll = axis === 'y' ? window.scrollY : window.scrollX;
      const size = axis === 'y' ? el.offsetHeight : el.offsetWidth;

      // Where the element's centre sits relative to the viewport centre, in
      // untransformed layout space.
      const centreInViewport = base + size / 2 - scroll;
      const progress = (centreInViewport - viewport / 2) / viewport;

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

    const onResize = () => {
      measureBase();
      onScroll();
    };

    measureBase();
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [speed, axis, scale, rotate, fade]);

  return ref;
}