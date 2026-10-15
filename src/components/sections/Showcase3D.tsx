import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, ArrowLeft, ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

interface Still {
  title: string;
  meta: string;
  duration: string;
  from: string;
  to: string;
}

const STILLS: Still[] = [
  { title: 'Neon Drift', meta: 'Short film', duration: '12:04', from: '174 90% 55%', to: '262 90% 62%' },
  { title: 'Salt & Iron', meta: 'Documentary', duration: '24:18', from: '262 90% 60%', to: '322 92% 60%' },
  { title: 'Aperture', meta: 'Title sequence', duration: '02:41', from: '322 92% 58%', to: '174 90% 52%' },
  { title: 'Halcyon', meta: 'Music video', duration: '04:32', from: '158 80% 50%', to: '262 88% 60%' },
  { title: 'Meridian', meta: 'Trailer', duration: '01:58', from: '200 90% 55%', to: '322 92% 60%' },
];

const LAST = STILLS.length - 1;

export function Showcase3D() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const targetRef = useRef(2);
  const currentRef = useRef(2);
  const interacted = useRef(false);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartTarget = useRef(0);
  const [activeIndex, setActiveIndex] = useState(2);

  const setTarget = useCallback((value: number | ((prev: number) => number)) => {
    const next = typeof value === 'function' ? value(targetRef.current) : value;
    targetRef.current = Math.min(Math.max(next, 0), LAST);
  }, []);

  /**
   * Layout + easing are applied imperatively (via refs) rather than through
   * React state, so the 3D transforms update every frame without re-rendering
   * the tree — smooth even on mobile.
   */
  useEffect(() => {
    let raf = 0;
    const apply = () => {
      const stage = stageRef.current;
      const unit = (stage ? stage.clientWidth : 900) / STILLS.length;

      // Ease the current position toward the target on every frame.
      currentRef.current += (targetRef.current - currentRef.current) * 0.11;
      const currentPos = currentRef.current;

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const offset = i - currentPos;
        const abs = Math.abs(offset);
        const clamped = Math.min(abs, 3);

        card.style.transform = `translate(-50%, -50%) translateX(${(offset * unit * 0.62).toFixed(2)}px) translateZ(${(-clamped * 150).toFixed(1)}px) rotateY(${(offset * -22).toFixed(2)}deg) scale(${(1 - clamped * 0.07).toFixed(3)})`;
        card.style.opacity = abs > 2.6 ? '0' : String(Math.max(1 - abs * 0.16, 0));
        card.style.zIndex = String(100 - Math.round(abs * 10));
        card.style.pointerEvents = abs > 2.6 ? 'none' : 'auto';
      });

      // Mark the visually-centred card as active for the control dots.
      const nearest = Math.round(currentPos);
      setActiveIndex((prev) => (prev === nearest ? prev : nearest));

      raf = requestAnimationFrame(apply);
    };
    raf = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ---- Gentle auto-advance until the visitor takes over ------------------ */
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      if (interacted.current || dragging.current) return;
      setTarget((t) => (t >= LAST ? 0 : Math.round(t) + 1));
    }, 3600);
    return () => clearInterval(id);
  }, [setTarget]);

  /* ---- Pointer interaction: hover on desktop, swipe on touch ------------- */
  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    interacted.current = true;
    if (dragging.current) {
      const stage = stageRef.current;
      if (!stage) return;
      const dx = event.clientX - dragStartX.current;
      const perCard = stage.clientWidth / STILLS.length;
      const next = dragStartTarget.current - dx / perCard;
      setTarget(next);
      return;
    }
    // Desktop hover: map cursor position across the stage to a still index.
    const stage = stageRef.current;
    if (!stage) return;
    if (event.pointerType !== 'mouse') return;
    const rect = stage.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    setTarget(ratio * LAST);
  }, [setTarget]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    interacted.current = true;
    dragging.current = true;
    dragStartX.current = event.clientX;
    dragStartTarget.current = targetRef.current;
    (event.currentTarget as HTMLDivElement).setPointerCapture?.(event.pointerId);
  }, []);

  const endDrag = useCallback(() => {
    dragging.current = false;
  }, []);

  const step = useCallback((dir: 1 | -1) => {
    interacted.current = true;
    setTarget((t) => Math.min(Math.max(Math.round(t) + dir, 0), LAST));
  }, [setTarget]);

  return (
    <section id="showreel" className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 h-[30rem] bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--violet)_14%,transparent),transparent_65%)]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Made in Imagireal
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-6 font-display text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
              Every frame,
              <span className="text-spectrum"> a possibility.</span>
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Drag, swipe or glide your cursor across the reel to explore work cut entirely inside
              Imagireal.
            </p>
          </Reveal>
        </div>
      </div>

      {/* 3D stage */}
      <div
        ref={stageRef}
        role="group"
        aria-label="Interactive 3D project gallery"
        onPointerMove={handlePointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        className="perspective relative mt-16 h-[300px] cursor-grab touch-pan-y select-none active:cursor-grabbing sm:h-[400px] lg:h-[460px]"
      >
        <div className="preserve-3d relative h-full w-full">
          {STILLS.map((still, i) => {
            const isActive = i === activeIndex;

            return (
              <button
                key={still.title}
                ref={(node) => {
                  cardRefs.current[i] = node;
                }}
                onClick={() => {
                  interacted.current = true;
                  setTarget(i);
                }}
                aria-label={`${still.title} — ${still.meta}`}
                className={cn(
                  'group absolute left-1/2 top-1/2 h-[190px] w-[300px] overflow-hidden rounded-2xl border text-left will-change-transform motion-reduce:transition-none sm:h-[260px] sm:w-[420px] lg:h-[300px] lg:w-[500px]',
                  isActive ? 'border-white/25' : 'border-white/8',
                )}
                style={{
                  transform: 'translate(-50%, -50%)',
                  transition: 'opacity 300ms ease, border-color 300ms ease',
                }}
              >
                {/* Faux graded still — layered gradients evoke a cinematic frame */}
                <span
                  className="absolute inset-0"
                  style={{
                    background: `
                      radial-gradient(120% 90% at 22% 18%, hsl(${still.from} / 0.85), transparent 58%),
                      radial-gradient(110% 90% at 82% 78%, hsl(${still.to} / 0.8), transparent 60%),
                      linear-gradient(155deg, #0a0b1c, #05060f 72%)`,
                  }}
                />
                {/* Subject silhouette + vignette for depth */}
                <span className="absolute inset-0 grid place-items-center">
                  <span className="h-1/2 w-1/4 rounded-[45%_45%_40%_40%/58%_58%_42%_42%] bg-black/40 blur-[3px]" />
                </span>
                <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.75),transparent_55%)]" />
                <span className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.035)_0px,rgba(255,255,255,0.035)_1px,transparent_1px,transparent_3px)] mix-blend-overlay" />

                {/* Play affordance on the active card */}
                <span
                  className={cn(
                    'pointer-events-none absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/15 backdrop-blur transition-all duration-300',
                    isActive ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
                  )}
                >
                  <Play className="size-5 fill-white text-white" />
                </span>

                {/* Caption */}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                  <span className="min-w-0">
                    <span className="block font-display text-lg font-semibold tracking-tight text-white">
                      {still.title}
                    </span>
                    <span className="block text-xs text-white/70">{still.meta}</span>
                  </span>
                  <span className="rounded-md bg-black/50 px-2 py-1 font-mono text-[10px] text-white/85">
                    {still.duration}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-10 flex items-center justify-center gap-5">
        <button
          onClick={() => step(-1)}
          aria-label="Previous project"
          className="grid size-11 place-items-center rounded-full border border-white/12 bg-white/5 text-foreground transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-4" />
        </button>

        <div className="flex items-center gap-2">
          {STILLS.map((still, i) => (
            <button
              key={still.title}
              onClick={() => {
                interacted.current = true;
                setTarget(i);
              }}
              aria-label={`Show ${still.title}`}
              aria-current={i === activeIndex}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                i === activeIndex ? 'w-8 bg-spectrum' : 'w-1.5 bg-white/20 hover:bg-white/40',
              )}
            />
          ))}
        </div>

        <button
          onClick={() => step(1)}
          aria-label="Next project"
          className="grid size-11 place-items-center rounded-full border border-white/12 bg-white/5 text-foreground transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowRight className="size-4" />
        </button>
      </div>
    </section>
  );
}