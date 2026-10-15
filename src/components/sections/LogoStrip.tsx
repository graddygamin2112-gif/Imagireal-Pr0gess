import { Marquee } from '@/components/motion/Marquee';
import { Reveal } from '@/components/motion/Reveal';

/** Fictional studios using Imagireal — set as wordmarks rather than images. */
const STUDIOS = [
  'NORTHWIND',
  'NEON HOUSE',
  'STUDIO KITE',
  'APERTURE 9',
  'MERIDIAN FILMS',
  'HALCYON POST',
  'CINÉ VÉRITÉ',
  'ORBITAL',
];

export function LogoStrip() {
  return (
    <section className="relative py-16">
      <Reveal>
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
          Powering post-production at
        </p>
      </Reveal>
      <Marquee speed={38}>
        {STUDIOS.map((studio) => (
          <span
            key={studio}
            className="font-display text-lg font-semibold tracking-[0.16em] text-muted-foreground/60 transition-colors hover:text-foreground sm:text-xl"
          >
            {studio}
          </span>
        ))}
      </Marquee>
    </section>
  );
}