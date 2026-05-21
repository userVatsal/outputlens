import { useEffect, useRef, useState } from 'react';

const stats = [
  { value: 10000, suffix: '',    label: 'Simulations per run' },
  { value: 2400,  suffix: '+',   label: 'Analysts onboarded'  },
  { value: 94.7,  suffix: '%',   label: 'Backtested accuracy', decimals: 1 },
  { value: 0.3,   suffix: 's',   label: 'Time to first result', prefix: '<', decimals: 1 },
];

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && setActive(true)),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border border border-border rounded-xl bg-surface overflow-hidden">
      {stats.map(s => (
        <div key={s.label} className="px-6 py-6 text-center">
          <div className="text-data-lg text-foreground">
            {s.prefix ?? ''}
            <CountUp to={s.value} decimals={s.decimals ?? 0} run={active} />
            {s.suffix}
          </div>
          <div className="text-label mt-2">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function CountUp({ to, decimals, run }: { to: number; decimals: number; run: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    const start = performance.now();
    const dur = 1200;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, to]);
  const formatted = decimals > 0
    ? n.toFixed(decimals)
    : Math.round(n).toLocaleString();
  return <span>{formatted}</span>;
}