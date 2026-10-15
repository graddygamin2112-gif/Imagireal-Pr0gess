import { useCallback, useRef, useState } from 'react';

interface TiltState {
  rotateX: number;
  rotateY: number;
  glareX: number;
  glareY: number;
}

const REST: TiltState = { rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 };

/**
 * Pointer-driven 3D tilt for cards. Tracks the cursor relative to the element
 * and emits rotateX/rotateY plus a glare position for the sheen highlight.
 */
export function useTilt(max = 12) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<TiltState>(REST);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const node = ref.current;
      if (!node) return;
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

      const rect = node.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      setState({
        rotateX: (0.5 - py) * max,
        rotateY: (px - 0.5) * max,
        glareX: px * 100,
        glareY: py * 100,
      });
    },
    [max],
  );

  const onPointerLeave = useCallback(() => setState(REST), []);

  return { ref, state, onPointerMove, onPointerLeave };
}