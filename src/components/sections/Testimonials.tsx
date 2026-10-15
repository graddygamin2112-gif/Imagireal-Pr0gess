import { Star } from 'lucide-react';
import { Marquee } from '@/components/motion/Marquee';
import { Reveal } from '@/components/motion/Reveal';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  hue: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'I cut a 12-minute narrative short end-to-end on a two-year-old laptop. No proxies. Imagireal is absurdly fast.',
    name: 'Maya Chen',
    role: 'Freelance editor · Sundance alum',
    hue: 174,
  },
  {
    quote: 'The node colour tools rival suites that cost more than my camera. That it is free still baffles me.',
    name: 'Diego Marr',
    role: 'Colourist, Neon House',
    hue: 266,
  },
  {
    quote: 'We replaced three subscriptions with one download. Our whole team moved over in a weekend.',
    name: 'Priya Raman',
    role: 'Post supervisor, Northwind',
    hue: 322,
  },
  {
    quote: 'Dialogue isolation saved a shoot with terrible location audio. It just worked, first try.',
    name: 'Tomas Berg',
    role: 'Documentary filmmaker',
    hue: 158,
  },
  {
    quote: 'Real-time collaboration on a timeline this smooth is something I did not think was possible in a browser-era app.',
    name: 'Aiko Tanaka',
    role: 'Lead editor, Studio Kite',
    hue: 174,
  },
  {
    quote: 'I teach a film class of 40 students. Free, professional-grade software changed what we can assign.',
    name: 'Prof. L. Adeyemi',
    role: 'Film & Media, University',
    hue: 266,
  },
];

function Card({ t }: { t: Testimonial }) {
  return (
    <figure className="w-[22rem] shrink-0 rounded-3xl border border-white/8 bg-card/50 p-6 transition-colors hover:border-white/16 sm:w-[26rem]">
      <div className="flex gap-1 text-iris">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="size-3.5 fill-current" />
        ))}
      </div>
      <blockquote className="mt-4 text-[0.975rem] leading-relaxed text-foreground/90">
        “{t.quote}”
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span
          className="grid size-10 place-items-center rounded-full font-display text-sm font-semibold text-[hsl(240_40%_5%)]"
          style={{ background: `linear-gradient(135deg, hsl(${t.hue} 90% 62%), hsl(${(t.hue + 40) % 360} 90% 58%))` }}
        >
          {t.name.charAt(0)}
        </span>
        <span>
          <span className="block text-sm font-medium text-foreground">{t.name}</span>
          <span className="block text-xs text-muted-foreground">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <h2 className="font-display text-[clamp(1.9rem,4.5vw,3.2rem)] font-semibold leading-[1.08] tracking-[-0.02em]">
              Trusted by editors who
              <br />
              <span className="text-spectrum">sweat every frame.</span>
            </h2>
          </Reveal>
        </div>
      </div>

      <div className="mt-14 space-y-6">
        <Marquee speed={64}>
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} t={t} />
          ))}
        </Marquee>
        <Marquee speed={72} reverse>
          {[...TESTIMONIALS].reverse().map((t) => (
            <Card key={`r-${t.name}`} t={t} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}