import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCw } from 'lucide-react';
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
  { title: 'Umbra', meta: 'Fashion film', duration: '03:15', from: '268 85% 58%', to: '318 90% 52%' },
];

const COUNT = STILLS.length;
/** Angular width of one card slot on the cylinder. */
const STEP = 360 / COUNT;
/** Cylinder radius, in px — tuned so cards overlap slightly at the sides. */
const RADIUS = 640;

export function Showcase3D() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const angleRef = useRef(0); // live rotation of the cylinder, in degrees
  const velocityRef = useRef(0); // deg per frame, for drag inertia
  const autoRef = useRef(true); // auto-rotation on until the user grabs it
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [spinning, setSpinning] = useState(true);

  /**
   * The whole carousel is animated imperatively in one rAF loop. Rotation
   * lives in a ref, so spinning never triggers a React re-render.
   */
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    const apply = () => {
      // Inertia after a drag, plus constant auto-rotation when idle.
      if (!draggingRef.current) {
        if (autoRef.current && !reduced) {
          angleRef.current += 0.18;
        }
        angleRef.current += velocityRef.current;
        velocityRef.current *= 0.94;
        if (Math.abs(velocityRef.current) < 0.002) velocityRef.current = 0;
      }

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        // Angle of this card relative to the camera.
        const theta = i * STEP + angleRef.current;
        const rad = (theta * Math.PI) / 180;
        const x = Math.sin(rad) * RADIUS;
        const z = Math.cos(rad) * RADIUS;

        const facing = (z + RADIUS) / (2 * RADIUS); // 1 = front, 0 = back
        card.style.transform = `translate(-50%, -50%) translateX(${x.toFixed(2)}px) translateZ(${z.toFixed(2)}px) rotateY(${(-theta).toFixed(2)}deg)`;
        card.style.opacity = String(Math.max(0, Math.min(1, (facing - 0.15) * 1.6)));
        card.style.zIndex = String(Math.round(z));
        card.style.pointerEvents = facing > 0.6 ? 'auto' : 'none';
        card.style.filter = `saturate(${(0.55 + facing * 0.75).toFixed(3)}) brightness(${(0.55 + facing * 0.7).toFixed(3)})`;
      });

      // Highlight whichever card is closest to the camera.
      const normalised = ((-angleRef.current % 360) + 360) % 360;
      const nearest = Math.round(normalised / STEP) % COUNT;
      setActiveIndex((prev) => (prev === nearest ? prev : nearest));

      raf = requestAnimationFrame(apply);
    };

    raf = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ---- Pointer interaction ------------------------------------------------- */
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    hasDraggedRef.current = false;
    lastXRef.current = e.clientX;
    velocityRef.current = 0;
    (e.currentTarget as HTMLDivElement).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    // Convert horizontal motion into rotation; scale down vertically-distant moves.
    const delta = dx * 0.35;
    angleRef.current += delta;
    velocityRef.current = delta;
    if (Math.abs(dx) > 3) hasDraggedRef.current = true;
  }, []);

  const endDrag = useCallback(() => {
    draggingRef.current = false;
  }, []);

  const toggleSpin = useCallback(() => {
    autoRef.current = !autoRef.current;
    setSpinning(autoRef.current);
  }, []);

  const focusCard = useCallback((index: number) => {
    autoRef.current = false;
    setSpinning(false);
    // Ease toward the shortest path to bring `index` to the front.
    const target = -index * STEP;
    const current = angleRef.current;
    const delta = ((target - current + 540) % 360) - 180;
    velocityRef.current = delta / 24;
  }, []);

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
              <span className="hidden sm:inline">Drag the reel to spin it, or let it drift. </span>
              <span className="sm:hidden">Swipe the reel to spin it. </span>
              Every one of these projects was cut entirely inside Imagireal.
            </p>
          </Reveal>
        </div>
      </div>

      {/* 3D cylinder stage */}
      <div
        ref={stageRef}
        role="group"
        aria-label="Interactive 3D project carousel"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        className="perspective relative mt-16 h-[320px] cursor-grab touch-pan-y select-none active:cursor-grabbing sm:h-[420px] lg:h-[480px]"
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
                  if (hasDraggedRef.current) return; // ignore the click that ends a drag
                  focusCard(i);
                }}
                aria-label={`${still.title} — ${still.meta}`}
                className={cn(
                  'group absolute left-1/2 top-1/2 h-[210px] w-[320px] overflow-hidden rounded-2xl border text-left will-change-transform sm:h-[280px] sm:w-[440px] lg:h-[320px] lg:w-[520px]',
                  isActive ? 'border-white/30' : 'border-white/10',
                )}
                style={{ transform: 'translate(-50%, -50%)', transition: 'border-color 300ms ease' }}
              >
                {/* Faux graded still */}
                <span
                  className="absolute inset-0"
                  style={{
                    background: `
                      radial-gradient(120% 90% at 22% 18%, hsl(${still.from} / 0.85), transparent 58%),
                      radial-gradient(110% 90% at 82% 78%, hsl(${still.to} / 0.8), transparent 60%),
                      linear-gradient(155deg, #0a0b1c, #05060f 72%)`,
                  }}
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="h-1/2 w-1/4 rounded-[45%_45%_40%_40%/58%_58%_42%_42%] bg-black/40 blur-[3px]" />
                </span>
                <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.78),transparent_55%)]" />
                <span className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.035)_0px,rgba(255,255,255,0.035)_1px,transparent_1px,transparent_3px)] mix-blend-overlay" />

                <span
                  className={cn(
                    'pointer-events-none absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/15 backdrop-blur transition-all duration-300',
                    isActive ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
                  )}
                >
                  <Play className="size-6 fill-white text-white" />
                </span>

                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                  <span className="min-w-0">
                    <span className="block font-display text-xl font-semibold tracking-tight text-white">
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

        {/* Drag hint */}
        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
          <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] text-white/60 backdrop-blur">
            ← drag to spin →
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-10 flex items-center justify-center gap-5">
        <button
          onClick={toggleSpin}
          aria-label={spinning ? 'Pause auto-spin' : 'Resume auto-spin'}
          aria-pressed={spinning}
          className="grid size-11 place-items-center rounded-full border border-white/12 bg-white/5 text-foreground transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {spinning ? <Pause className="size-4" /> : <RotateCw className="size-4" />}
        </button>

        <div className="flex items-center gap-2">
          {STILLS.map((still, i) => (
            <button
              key={still.title}
              onClick={() => focusCard(i)}
              aria-label={`Show ${still.title}`}
              aria-current={i === activeIndex}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                i === activeIndex ? 'w-8 bg-spectrum' : 'w-1.5 bg-white/20 hover:bg-white/40',
              )}
            />
          ))}
        </div>

        <span className="w-11 text-center font-mono text-xs text-muted-foreground">
          {String(activeIndex + 1).padStart(2, '0')}/{String(COUNT).padStart(2, '0')}
        </span>
      </div>
    </section>
  );
}