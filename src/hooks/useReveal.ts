import { useEffect, useRef, useState } from 'react';

interface RevealOptions {
  /** Fraction of the element that must be visible before revealing. */
  threshold?: number;
  /** Root margin, e.g. "-10% 0px". */
  rootMargin?: string;
  /** Keep the element revealed after the first intersection. */
  once?: boolean;
}

/**
 * Observe an element and report when it enters the viewport.
 * Backs every scroll-triggered animation on the marketing site.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  { threshold = 0.18, rootMargin = '0px 0px -8% 0px', once = true }: RevealOptions = {},
) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No IntersectionObserver (or reduced motion): show immediately.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, visible };
}