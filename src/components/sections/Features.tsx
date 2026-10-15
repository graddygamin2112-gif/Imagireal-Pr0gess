import type { LucideIcon } from 'lucide-react';
import {
  AudioLines,
  Layers,
  Gauge,
  Wand2,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { useTilt } from '@/hooks/useTilt';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
  /** Colour accent token for the card glow. */
  accent: string;
  /** Tailwind grid span classes. */
  span: string;
}

const FEATURES: Feature[] = [
  {
    icon: Gauge,
    title: 'Real-time 8K engine',
    body: 'A GPU-accelerated pipeline scrubs native 8K footage with zero proxies and zero render wait. Playback is always instant.',
    accent: 'var(--iris)',
    span: 'lg:col-span-3 lg:row-span-2',
  },
  {
    icon: Wand2,
    title: 'Generative retouch',
    body: 'Remove objects, extend frames and relight a shot — locally, with no uploads and no per-minute billing.',
    accent: 'var(--violet)',
    span: 'lg:col-span-3',
  },
  {
    icon: Layers,
    title: 'Infinite node colour',
    body: 'A non-destructive node graph for grade, with LUTs, scopes and film emulation baked in.',
    accent: 'var(--magenta)',
    span: 'lg:col-span-2',
  },
  {
    icon: AudioLines,
    title: 'Studio sound',
    body: 'AI dialogue isolation, stem separation and loudness targets that hit broadcast spec automatically.',
    accent: 'var(--mint)',
    span: 'lg:col-span-1',
  },
  {
    icon: Users,
    title: 'Live collaboration',
    body: 'Share a timeline and edit together in real time. Reviewers leave frame-accurate notes.',
    accent: 'var(--iris)',
    span: 'lg:col-span-3',
  },
  {
    icon: ShieldCheck,
    title: 'Truly free exports',
    body: 'Every codec, every resolution, no watermark. Imagireal never puts your best work behind a paywall.',
    accent: 'var(--violet)',
    span: 'lg:col-span-3',
  },
];

function FeatureCard({ feature, delay }: { feature: Feature; delay: number }) {
  const { ref, state, onPointerMove, onPointerLeave } = useTilt(9);
  const Icon = feature.icon;

  return (
    <Reveal delay={delay} className={cn('perspective', feature.span)}>
      <div
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        style={{
          transform: `rotateX(${state.rotateX}deg) rotateY(${state.rotateY}deg)`,
        }}
        className={cn(
          'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/8 bg-card/60 p-7',
          'transition-[transform,box-shadow] duration-300 ease-out will-change-transform preserve-3d motion-reduce:transform-none',
          'hover:border-white/16 hover:shadow-[0_40px_120px_-50px_rgba(0,0,0,0.9)]',
        )}
      >
        {/* Accent glow */}
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at ${state.glareX}% ${state.glareY}%, color-mix(in oklab, ${feature.accent} 22%, transparent), transparent 55%)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 -top-px h-px opacity-40"
          style={{ background: `linear-gradient(90deg, transparent, ${feature.accent}, transparent)` }}
        />

        <span
          className="relative grid size-12 place-items-center rounded-2xl border border-white/10"
          style={{ background: `color-mix(in oklab, ${feature.accent} 14%, transparent)` }}
        >
          <Icon className="size-6" style={{ color: feature.accent }} />
        </span>

        <h3 className="relative mt-6 font-display text-xl font-semibold tracking-tight">
          {feature.title}
        </h3>
        <p className="relative mt-3 max-w-md text-[0.975rem] leading-relaxed text-muted-foreground">
          {feature.body}
        </p>
      </div>
    </Reveal>
  );
}

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-28 py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Built for professionals
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-6 font-display text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
              Everything a suite should be.
              <br />
              <span className="text-spectrum">Nothing it shouldn&apos;t.</span>
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Imagireal compresses a full post-production pipeline into one fast, focused app — so you
              spend your time cutting, not waiting.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6 lg:auto-rows-[minmax(0,auto)]">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} delay={i * 70} />
          ))}
        </div>
      </div>
    </section>
  );
}