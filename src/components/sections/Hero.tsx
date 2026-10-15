import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { HeroCanvas } from '@/components/hero/HeroCanvas';
import { Reveal } from '@/components/motion/Reveal';
import { useParallax } from '@/hooks/useParallax';

/** Words that cycle through the hero headline. */
const ROTATING = ['Timelines', 'Storyboards', 'Grade', 'Sound', 'Anything'];

export function Hero() {
  const [index, setIndex] = useState(0);
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const [widths, setWidths] = useState<number[]>([]);

  // Scroll-scrubbed layers — the hero recedes and dissolves as you scroll.
  const canvasRef = useParallax<HTMLCanvasElement>({ speed: 0.28, scale: -0.12, fade: true });
  const contentRef = useParallax<HTMLDivElement>({ speed: 0.14, scale: -0.06, fade: true });

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % ROTATING.length), 2200);
    return () => clearInterval(id);
  }, []);

  /**
   * Measure the natural width of each rotating word so the container can
   * animate to the active one. This is what makes "Edit" glide toward shorter
   * words instead of leaving the gap left behind by the longest word.
   */
  useLayoutEffect(() => {
    const measure = () => {
      const container = measureRef.current;
      if (!container) return;
      const spans = Array.from(container.children) as HTMLElement[];
      const next = spans.map((span) => span.getBoundingClientRect().width);
      setWidths(next);
    };

    measure();
    // Fonts finish loading after first paint and change glyph widths.
    document.fonts?.ready.then(measure).catch(() => undefined);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const activeWidth = widths[index];

  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <section id="top" className="relative isolate min-h-[100svh] overflow-hidden pt-28">
      {/* Ambient gradient field */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-[-10%] size-[42rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--iris)_38%,transparent),transparent_65%)] blur-3xl animate-drift" />
        <div className="absolute right-[-15%] top-[8%] size-[38rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--violet)_40%,transparent),transparent_65%)] blur-3xl animate-drift [animation-delay:-6s]" />
        <div className="absolute bottom-[-20%] left-1/3 size-[34rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--magenta)_32%,transparent),transparent_65%)] blur-3xl animate-drift [animation-delay:-12s]" />
        <div className="absolute inset-0 bg-grid opacity-[0.35] mask-fade-y" />
      </div>

      <HeroCanvas ref={canvasRef} className="absolute inset-0 -z-[5] size-full opacity-80 [mask-image:radial-gradient(circle_at_60%_45%,black_0%,transparent_72%)]" />

      <div ref={contentRef} className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-24 pt-10 text-center sm:px-6 lg:pt-16">
        <Reveal from="down">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur">
            <Sparkles className="size-3.5 text-iris" />
            Free forever for independent editors
            <span className="ml-1 rounded-full bg-mint/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-mint">
              v3.0
            </span>
          </span>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="relative mt-8 font-display text-[clamp(2.6rem,9vw,7rem)] font-semibold leading-[0.94] tracking-[-0.03em]">
            {/* Hidden rulers: measured so the rotating word's container can
                animate to the width of whichever word is showing. */}
            <span
              ref={measureRef}
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 -z-10 whitespace-nowrap opacity-0"
            >
              {ROTATING.map((word) => (
                <span key={word} className="inline-block">
                  {word}
                </span>
              ))}
            </span>

            Edit{' '}
            <span
              className="relative inline-grid overflow-hidden align-bottom transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
              style={{ width: activeWidth && activeWidth > 0 ? `${activeWidth}px` : undefined }}
            >
              {ROTATING.map((word, i) => (
                <span
                  key={word}
                  aria-hidden={i !== index}
                  className="col-start-1 row-start-1 whitespace-nowrap text-spectrum transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                  style={{
                    transform: `translateY(${(i - index) * 100}%)`,
                    opacity: i === index ? 1 : 0,
                  }}
                >
                  {word}
                </span>
              ))}
            </span>
            <br />
            at the speed of thought.
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-7 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Imagireal is a professional-grade, GPU-accelerated editing suite that runs flawlessly on
            the machine you already own. No subscriptions. No watermarks. No limits.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <button
              onClick={() => scrollTo('#pricing')}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-spectrum px-7 py-4 text-base font-semibold text-[hsl(240_40%_5%)] shadow-[0_20px_60px_-20px_rgba(45,230,209,0.7)] transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="relative z-10">Get Imagireal free</span>
              <ArrowRight className="relative z-10 size-5 transition-transform duration-300 group-hover:translate-x-1" />
              <span className="absolute inset-0 -translate-x-full bg-white/30 transition-transform duration-500 group-hover:translate-x-0" />
            </button>
            <button
              onClick={() => scrollTo('#studio')}
              className="group inline-flex items-center gap-3 rounded-2xl border border-white/12 bg-white/5 px-6 py-4 text-base font-medium text-foreground backdrop-blur transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="grid size-8 place-items-center rounded-full bg-white/10 transition-transform duration-300 group-hover:scale-110">
                <Play className="size-3.5 fill-current" />
              </span>
              Try the live demo
            </button>
          </div>
        </Reveal>

        <Reveal delay={320}>
          <p className="mt-6 text-sm text-muted-foreground/80">
            macOS · Windows · Linux — 48&nbsp;MB download, instant launch
          </p>
        </Reveal>
      </div>

      {/* Fade into the next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </section>
  );
}