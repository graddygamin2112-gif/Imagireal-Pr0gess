import { ArrowRight, AtSign, Code2, Play } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Reveal } from '@/components/motion/Reveal';

export function CTA() {
  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <section className="relative px-4 py-24 sm:px-6 sm:py-32">
      <Reveal from="scale">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/10 px-6 py-20 text-center sm:px-16">
          {/* Layered gradient background */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,color-mix(in_oklab,var(--iris)_35%,transparent),transparent_60%),radial-gradient(ellipse_at_75%_80%,color-mix(in_oklab,var(--magenta)_32%,transparent),transparent_60%),linear-gradient(160deg,#0b0c20,#05060f)]" />
            <div className="absolute inset-0 bg-grid opacity-[0.25] mask-fade-y" />
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-white/80 backdrop-blur">
            Free forever
          </span>
          <h2 className="mx-auto mt-6 max-w-3xl font-display text-[clamp(2.2rem,6vw,4.4rem)] font-semibold leading-[1] tracking-[-0.03em]">
            Your next edit deserves
            <br />
            <span className="text-spectrum">a better timeline.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Download Imagireal in under a minute. Import your footage, start cutting, and export in
            full quality — free, today.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => scrollTo('#top')}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-spectrum px-8 py-4 text-base font-semibold text-[hsl(240_40%_5%)] shadow-[0_24px_70px_-24px_rgba(45,230,209,0.8)] transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="relative z-10">Download Imagireal</span>
              <ArrowRight className="relative z-10 size-5 transition-transform duration-300 group-hover:translate-x-1" />
              <span className="absolute inset-0 -translate-x-full bg-white/30 transition-transform duration-500 group-hover:translate-x-0" />
            </button>
            <button
              onClick={() => scrollTo('#studio')}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-7 py-4 text-base font-medium text-foreground backdrop-blur transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Explore the demo
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const FOOTER_LINKS: { heading: string; links: string[] }[] = [
  { heading: 'Product', links: ['Features', 'Studio', 'Workflow', 'Pricing', 'Changelog'] },
  { heading: 'Resources', links: ['Documentation', 'Tutorials', 'Keyboard map', 'Plugins', 'Community'] },
  { heading: 'Company', links: ['About', 'Careers', 'Press kit', 'Contact', 'Status'] },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/8 px-4 pb-12 pt-16 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.5fr_2fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Imagireal is a free, professional video editing suite built for editors who refuse to
              compromise on quality — or on price.
            </p>
            <div className="mt-6 flex gap-3">
              {[Code2, AtSign, Play].map((Icon, i) => (
                <a
                  key={i}
                  href="#top"
                  aria-label="Imagireal social profile"
                  className="grid size-10 place-items-center rounded-xl border border-white/10 text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER_LINKS.map((group) => (
              <div key={group.heading}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                  {group.heading}
                </h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#top"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Imagireal. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Vibed with{' '}
            <a
              href="https://shakespeare.diy"
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-iris underline-offset-4 transition-colors hover:underline"
            >
              Shakespeare
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}