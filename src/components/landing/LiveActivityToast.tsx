import { useEffect, useState } from 'react';

const POOL = [
  { name: 'Stefan K.',  role: 'Portfolio Manager' },
  { name: 'Amelia R.',  role: 'Risk Analyst' },
  { name: 'Devon P.',   role: 'Quant Researcher' },
  { name: 'Yuki T.',    role: 'Derivatives Trader' },
  { name: 'Marco D.',   role: 'Head of Quant Risk' },
  { name: 'Priya S.',   role: 'Senior Portfolio Manager' },
  { name: 'Ola B.',     role: 'Volatility Strategist' },
  { name: 'Jonas W.',   role: 'Multi-Asset PM' },
];

const ACTIONS = [
  'just ran a Monte Carlo simulation',
  'unlocked a tail-risk distribution',
  'analysed a new position',
  'detected a regime shift',
];

function pick<T>(a: T[]) { return a[Math.floor(Math.random() * a.length)]; }

export function LiveActivityToast() {
  const [item, setItem] = useState<{ id: number; name: string; role: string; action: string; mins: number } | null>(null);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    const schedule = (delay: number) => {
      timer = setTimeout(() => {
        if (!alive) return;
        const p = pick(POOL);
        setItem({ id: Date.now(), name: p.name, role: p.role, action: pick(ACTIONS), mins: Math.floor(4 + Math.random() * 26) });
        // auto-dismiss
        setTimeout(() => alive && setItem(null), 4200);
        schedule(45000 + Math.random() * 45000);
      }, delay);
    };

    schedule(5000); // first toast after 5s
    return () => { alive = false; clearTimeout(timer); };
  }, []);

  if (!item) return null;

  return (
    <div className="fixed bottom-5 left-5 z-40 max-w-[320px] hidden sm:block pointer-events-none">
      <div
        key={item.id}
        className="glass-card-dark border-l-2 border-l-primary px-4 py-3 animate-stagger-up"
        style={{ boxShadow: '0 10px 30px -10px hsl(0 0% 0% / 0.6)' }}
      >
        <div className="flex items-start gap-3">
          <span className="live-dot mt-1.5" />
          <div className="min-w-0">
            <p className="text-sm text-foreground leading-snug">
              <span className="font-semibold">{item.name}</span>
              <span className="text-muted-foreground">, {item.role}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.action}</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1 font-mono">{item.mins} min ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}