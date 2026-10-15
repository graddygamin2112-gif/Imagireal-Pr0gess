import type { ElementType, ReactNode } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Delay before the animation starts, in ms. */
  delay?: number;
  /** Direction the element travels from. */
  from?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'rotate' | 'none';
  /** Render as a different element (defaults to div). */
  as?: ElementType;
}

const hiddenState: Record<NonNullable<RevealProps['from']>, string> = {
  up: 'translate-y-12',
  down: '-translate-y-12',
  left: '-translate-x-12',
  right: 'translate-x-12',
  scale: 'scale-[0.92]',
  rotate: '-rotate-3 scale-[0.94]',
  none: '',
};

/**
 * Wrap content in a scroll-triggered entrance transition. Combines opacity,
 * translation, blur and scale for a soft, cinematic arrival, and collapses to a
 * plain visible element when motion is reduced.
 */
export function Reveal({ children, className, delay = 0, from = 'up', as }: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const Tag = (as ?? 'div') as ElementType;

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={cn(
        'transition-all duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform motion-reduce:transition-none',
        visible
          ? 'opacity-100 translate-y-0 translate-x-0 scale-100 rotate-0 blur-none'
          : cn('opacity-0 blur-[6px]', hiddenState[from]),
        className,
      )}
    >
      {children}
    </Tag>
  );
}