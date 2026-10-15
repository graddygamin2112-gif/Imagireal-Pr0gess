import { useEffect, useRef, useState } from 'react';
import {
  Film,
  Scissors,
  SlidersHorizontal,
  Rocket,
  type LucideIcon,
} from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

interface Step {
  icon: LucideIcon;
  kicker: string;
  title: string;
  body: string;
  accent: string;
}

const STEPS: Step[] = [
  {
    icon: Film,
    kicker: 'Ingest',
    title: 'Drop in anything',
    body: 'RED, BRAW, ProRes, H.265, phone footage — Imagireal decodes it natively and builds proxies before you finish your coffee.',
    accent: 'var(--iris)',
  },
  {
    icon: Scissors,
    kicker: 'Cut',
    title: 'Trim at the pace of instinct',
    body: 'Magnetic timeline, source tape scrubbing and ripple edits that anticipate your next move. Keyboard-first, always fluid.',
    accent: 'var(--violet)',
  },
  {
    icon: SlidersHorizontal,
    kicker: 'Grade',
    title: 'Shape the look',
    body: 'Push the image with film emulation, wheels and a node graph — scoped and referenced, never destructive.',
    accent: 'var(--magenta)',
  },
  {
    icon: Rocket,
    kicker: 'Ship',
    title: 'Deliver in one click',
    body: 'Every codec and resolution, free. Render in the background or hand off a matched project file to the rest of your team.',
    accent: 'var(--mint)',
  },
];

export function Workflow() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;

      const rect = wrap.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const ratio = total > 0 ? scrolled / total : 0;
      setProgress(ratio);

      const step = Math.min(Math.floor(ratio * STEPS.length), STEPS.length - 1);
      setActive(step);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section id="workflow" className="relative scroll-mt-24">
      <div ref={wrapRef} className="relative h-[220vh] sm:h-[300vh] lg:h-[360vh]">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-1/2 size-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--violet)_16%,transparent),transparent_70%)] blur-3xl" />
          </div>

          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
            {/* Sticky visual */}
            <div className="relative order-2 hidden aspect-square max-w-lg lg:order-1 lg:block">
              <div className="absolute inset-0 grid place-items-center">
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const offset = i - active;
                  return (
                    <div
                      key={step.title}
                      className="absolute inset-0 grid place-items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                      style={{
                        opacity: i === active ? 1 : 0,
                        transform: `translateY(${offset * 40}px) scale(${i === active ? 1 : 0.9})`,
                        filter: i === active ? 'blur(0)' : 'blur(6px)',
                      }}
                    >
                      <div
                        className="relative grid size-[22rem] place-items-center rounded-[3rem] border border-white/10"
                        style={{
                          background: `radial-gradient(circle at 50% 30%, color-mix(in oklab, ${step.accent} 26%, transparent), transparent 70%)`,
                        }}
                      >
                        <Icon className="size-24" style={{ color: step.accent }} strokeWidth={1.2} />
                        {/* Orbiting ring */}
                        <div className="absolute inset-0 rounded-[3rem] border border-white/5 animate-spin-slow [animation-duration:32s]">
                          <span
                            className="absolute left-1/2 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                            style={{ background: step.accent, boxShadow: `0 0 18px ${step.accent}` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Copy */}
            <div className="order-1 lg:order-2">
              <Reveal>
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  The Imagireal flow
                </span>
              </Reveal>
              <h2 className="mt-5 font-display text-[clamp(1.9rem,4.5vw,3.2rem)] font-semibold leading-[1.08] tracking-[-0.02em]">
                From card to colour to
                <br />
                <span className="text-spectrum">finished cut.</span>
              </h2>

              <div className="mt-10 flex flex-col gap-2">
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const isActive = i === active;
                  return (
                    <div
                      key={step.title}
                      className={cn(
                        'relative overflow-hidden rounded-2xl border p-5 transition-all duration-500',
                        isActive
                          ? 'border-white/14 bg-white/[0.05]'
                          : 'border-white/6 bg-transparent opacity-55',
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10"
                          style={{
                            background: isActive
                              ? `color-mix(in oklab, ${step.accent} 18%, transparent)`
                              : 'transparent',
                          }}
                        >
                          <Icon className="size-5" style={{ color: isActive ? step.accent : 'currentcolor' }} />
                        </span>
                        <div className="min-w-0">
                          <span
                            className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                            style={{ color: isActive ? step.accent : 'var(--muted-foreground)' }}
                          >
                            {step.kicker}
                          </span>
                          <h3 className="font-display text-lg font-semibold tracking-tight">{step.title}</h3>
                        </div>
                      </div>
                      <div
                        className={cn(
                          'grid transition-all duration-500',
                          isActive ? 'mt-3 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0',
                        )}
                      >
                        <p className="overflow-hidden text-[0.95rem] leading-relaxed text-muted-foreground">
                          {step.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Step progress rail */}
              <div className="mt-8 flex items-center gap-2">
                {STEPS.map((step, i) => (
                  <span
                    key={step.title}
                    className="h-1 flex-1 overflow-hidden rounded-full bg-white/8"
                  >
                    <span
                      className="block h-full origin-left rounded-full bg-spectrum transition-transform duration-300"
                      style={{
                        transform: `scaleX(${Math.min(Math.max(
                          i < active ? 1 : i === active ? progress * STEPS.length - active : 0,
                          0,
                        ), 1)})`,
                      }}
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}