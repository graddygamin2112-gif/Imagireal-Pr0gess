import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  /** Reverse the scroll direction. */
  reverse?: boolean;
  /** Seconds for one full loop. */
  speed?: number;
}

/**
 * Infinite horizontal marquee. The children are rendered twice so the loop is
 * seamless; animation is CSS-driven and paused for reduced-motion users.
 */
export function Marquee({ children, className, reverse = false, speed = 40 }: MarqueeProps) {
  return (
    <div className={cn('group relative flex overflow-hidden mask-fade-x', className)}>
      <div
        className={cn(
          'flex min-w-full shrink-0 items-center gap-12 pr-12',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee',
          'group-hover:[animation-play-state:paused] motion-reduce:animate-none',
        )}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}