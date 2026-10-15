import type { ReactNode } from 'react';
import { Reveal } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  align?: 'center' | 'left';
}

/**
 * Shared section heading with a consistent reveal choreography: eyebrow, then
 * title, then subtitle, each arriving a beat apart.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
  align = 'center',
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl text-left',
        className,
      )}
    >
      {eyebrow && (
        <Reveal from="down">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={80}>
        <h2 className="mt-6 font-display text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={150}>
          <p
            className={cn(
              'mt-6 text-lg leading-relaxed text-muted-foreground',
              align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-2xl',
            )}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}