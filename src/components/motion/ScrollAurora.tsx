import { useEffect, useRef } from 'react';

/**
 * A page-wide aurora that drifts and shifts hue as the visitor scrolls.
 * Renders two large, heavily-blurred radial gradients whose position and colour
 * are driven straight to the DOM — no React re-renders while scrolling.
 */
export function ScrollAurora() {
  const layerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = layerRef.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;
    const apply = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      const hue = 174 + p * 160; // iris → violet → magenta sweep
      el.style.setProperty('--aurora-hue', hue.toFixed(1));
      el.style.transform = `translate3d(0, ${(-p * 80).toFixed(1)}px, 0)`;
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

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-70"
      style={{ ['--aurora-hue' as string]: '174' }}
    >
      <div
        className="absolute -left-1/4 top-[10%] size-[50rem] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, hsl(var(--aurora-hue) 90% 55% / 0.18), transparent 62%)' }}
      />
      <div
        className="absolute -right-1/4 top-[45%] size-[46rem] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, hsl(calc(var(--aurora-hue) + 90) 88% 58% / 0.16), transparent 62%)' }}
      />
      <div
        className="absolute bottom-[-10%] left-1/4 size-[44rem] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, hsl(calc(var(--aurora-hue) + 150) 90% 58% / 0.14), transparent 62%)' }}
      />
    </div>
  );
}