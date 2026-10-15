import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  /** Size of the square aperture glyph in pixels. */
  size?: number;
  /** Hide the "Imagireal" wordmark. */
  markOnly?: boolean;
}

/**
 * Imagireal brand mark — a stylised camera aperture that doubles as a play
 * triangle. Built from inline SVG so it scales crisply and animates with the
 * brand spectrum.
 */
export function Logo({ className, size = 32, markOnly = false }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <span
        className="relative grid place-items-center rounded-xl"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 48 48"
          width={size}
          height={size}
          role="img"
          aria-label="Imagireal"
          className="drop-shadow-[0_4px_18px_rgba(45,230,209,0.35)]"
        >
          <defs>
            <linearGradient id="imagi-mark" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--iris)" />
              <stop offset="52%" stopColor="var(--violet)" />
              <stop offset="100%" stopColor="var(--magenta)" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#imagi-mark)" />
          <rect
            x="2"
            y="2"
            width="44"
            height="44"
            rx="13"
            fill="none"
            stroke="rgba(255,255,255,0.18)"
          />
          {/* Aperture blades */}
          <g stroke="rgba(6,8,18,0.85)" strokeWidth="2.4" strokeLinecap="round">
            <path d="M24 12 L34 18" />
            <path d="M34 18 L34 30" />
            <path d="M34 30 L24 36" />
            <path d="M24 36 L14 30" />
            <path d="M14 30 L14 18" />
            <path d="M14 18 L24 12" />
          </g>
          {/* Play triangle core */}
          <path d="M21 18.5 L30 24 L21 29.5 Z" fill="rgba(6,8,18,0.9)" />
        </svg>
      </span>
      {!markOnly && (
        <span className="font-display text-lg font-semibold tracking-tight text-foreground">
          Imagireal
        </span>
      )}
    </span>
  );
}