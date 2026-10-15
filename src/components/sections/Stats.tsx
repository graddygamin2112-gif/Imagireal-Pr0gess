import { useCountUp } from '@/hooks/useCountUp';
import { Reveal } from '@/components/motion/Reveal';

interface Stat {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
}

const STATS: Stat[] = [
  { value: 2.4, suffix: 'M+', decimals: 1, label: 'Editors creating daily' },
  { value: 12, suffix: 'M', label: 'Timeline actions / second' },
  { value: 100, suffix: '%', label: 'Free. No paywalled exports' },
  { value: 4.9, suffix: '/5', decimals: 1, label: 'Average creator rating' },
];

function StatItem({ stat, delay }: { stat: Stat; delay: number }) {
  const { ref, value } = useCountUp({
    to: stat.value,
    decimals: stat.decimals ?? 0,
    duration: 2000,
  });

  return (
    <Reveal delay={delay} className="text-center sm:text-left">
      <div className="font-display text-[clamp(2.2rem,5vw,3.4rem)] font-semibold leading-none tracking-tight">
        <span className="text-spectrum">
          {stat.prefix}
          <span ref={ref}>{value.toFixed(stat.decimals ?? 0)}</span>
          {stat.suffix}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
    </Reveal>
  );
}

export function Stats() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
      <div className="glass grid grid-cols-2 gap-8 rounded-3xl p-8 sm:p-12 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <StatItem key={stat.label} stat={stat} delay={i * 90} />
        ))}
      </div>
    </section>
  );
}