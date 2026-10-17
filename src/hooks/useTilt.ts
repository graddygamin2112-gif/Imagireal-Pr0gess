import { useCallback, useRef, useState } from 'react';

interface TiltState {
  rotateX: number;
  rotateY: number;
  glareX: number;
  glareY: number;
}

const REST: TiltState = { rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 };

/**
 * Pointer-driven 3D tilt for cards.
 *
 * The pointer ratio is computed from the element's *layout* box
 * (`offsetWidth`/`offsetHeight` plus the document offset), not its rendered
 * bounding rect. That is essential: the card is rotated by this very hook, so
 * reading `getBoundingClientRect()` would feed the tilt back into the
 * measurement and make the card jitter under the cursor.
 */
export function useTilt(max = 12) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<TiltState>(REST);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const node = ref.current;
      if (!node) return;
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

      // Accumulate the element's layout position on the document.
      let left = 0;
      let top = 0;
      let el: HTMLElement | null = node;
      while (el) {
        left += el.offsetLeft;
        top += el.offsetTop;
        el = el.offsetParent as HTMLElement | null;
      }

      const px = (event.clientX + window.scrollX - left) / (node.offsetWidth || 1);
      const py = (event.clientY + window.scrollY - top) / (node.offsetHeight || 1);

      const clampedX = Math.min(Math.max(px, 0), 1);
      const clampedY = Math.min(Math.max(py, 0), 1);

      setState({
        rotateX: (0.5 - clampedY) * max,
        rotateY: (clampedX - 0.5) * max,
        glareX: clampedX * 100,
        glareY: clampedY * 100,
      });
    },
    [max],
  );

  const onPointerLeave = useCallback(() => setState(REST), []);

  return { ref, state, onPointerMove, onPointerLeave };
}