import type { ElementType, ReactNode } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Delay before the animation starts, in ms. */
  delay?: number;
  /** Direction the element travels from. */
  from?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';
  /** Render as a different element (defaults to div). */
  as?: ElementType;
}

const offset: Record<NonNullable<RevealProps['from']>, string> = {
  up: 'translate-y-10',
  down: '-translate-y-10',
  left: '-translate-x-10',
  right: 'translate-x-10',
  scale: 'scale-[0.94]',
  none: '',
};

/**
 * Wraps children in a scroll-triggered entrance animation. Falls back to a
 * plain, immediately-visible element when motion is reduced.
 */
export function Reveal({ children, className, delay = 0, from = 'up', as }: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const Tag = (as ?? 'div') as ElementType;

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={cn(
        'transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform motion-reduce:transition-none',
        visible ? 'opacity-100 translate-y-0 translate-x-0 scale-100 blur-0' : cn('opacity-0 blur-[2px]', offset[from]),
        className,
      )}
    >
      {children}
    </Tag>
  );
}