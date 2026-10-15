import { Check, Sparkles } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

interface Plan {
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

const PLANS: Plan[] = [
  {
    name: 'Imagireal Free',
    price: '$0',
    cadence: 'forever',
    tagline: 'The full editor. Zero asterisks.',
    features: [
      'Unlimited timelines & projects',
      '8K playback with GPU acceleration',
      'Full node colour & film emulation',
      'Every export codec, no watermark',
      'Studio sound toolkit',
      'macOS · Windows · Linux',
    ],
    cta: 'Download Free',
    featured: true,
  },
  {
    name: 'Studio',
    price: '$19',
    cadence: '/ month',
    tagline: 'For teams shipping together.',
    features: [
      'Everything in Free',
      'Real-time collaborative editing',
      'Shared asset & project cloud',
      'Frame-accurate review links',
      'Priority render farm queue',
      'SSO & role-based access',
    ],
    cta: 'Start 30-day trial',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    cadence: 'annual',
    tagline: 'Security and scale, tailored.',
    features: [
      'Everything in Studio',
      'On-prem & air-gapped install',
      'Custom plugin SDK',
      'Dedicated solutions engineer',
      '99.99% uptime SLA',
    ],
    cta: 'Talk to sales',
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative scroll-mt-24 py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[36rem] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--iris)_12%,transparent),transparent_65%)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Pricing
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-6 font-display text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
              Professional tools should be
              <br />
              <span className="text-spectrum">available to everyone.</span>
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              No subscription walls, no export tax. Imagireal stays free for independent editors — paid
              plans only add collaboration for teams.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 100} from="up" className="h-full">
              <div
                className={cn(
                  'relative h-full rounded-3xl transition-transform duration-500',
                  plan.featured
                    ? 'bg-spectrum p-px shadow-[0_50px_140px_-60px_rgba(45,230,209,0.6)] hover:-translate-y-1'
                    : 'border border-white/8 bg-card/50 hover:border-white/16',
                )}
              >
                <div
                  className={cn(
                    'relative flex h-full flex-col overflow-hidden p-8',
                    plan.featured ? 'rounded-[23px] bg-card' : 'rounded-3xl',
                  )}
                >
                  {plan.featured && (
                    <span className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full bg-spectrum px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[hsl(240_40%_5%)]">
                      <Sparkles className="size-3" /> Most popular
                    </span>
                  )}

                  <h3 className="font-display text-lg font-semibold tracking-tight">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="font-display text-5xl font-semibold tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">{plan.cadence}</span>
                  </div>

                  <ul className="mt-8 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-foreground/90">
                        <span
                          className={cn(
                            'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full',
                            plan.featured ? 'bg-spectrum text-[hsl(240_40%_5%)]' : 'bg-white/8 text-iris',
                          )}
                        >
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    className={cn(
                      'group/btn relative mt-8 inline-flex items-center justify-center overflow-hidden rounded-2xl px-6 py-3.5 text-sm font-semibold transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      plan.featured
                        ? 'bg-spectrum text-[hsl(240_40%_5%)]'
                        : 'border border-white/12 bg-white/5 text-foreground hover:bg-white/10',
                    )}
                  >
                    <span className="relative z-10">{plan.cta}</span>
                    {plan.featured && (
                      <span className="absolute inset-0 -translate-x-full bg-white/30 transition-transform duration-500 group-hover/btn:translate-x-0" />
                    )}
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}