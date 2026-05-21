import { useEffect, useState } from 'react';

export interface FeedCard {
  id: string;
  kind: 'regime' | 'vol' | 'divergence' | 'tail' | 'correlation';
  title: string;
  body: string;
  asset?: string;
  cta: string;
  href: string;
  createdAt: number; // ms
  unread: boolean;
}

const POOL: Omit<FeedCard, 'id' | 'createdAt' | 'unread'>[] = [
  { kind: 'regime', title: 'Regime Signal', asset: 'AAPL',
    body: 'AAPL showing vol compression consistent with pre-breakout pattern. P(breakout > 5%) = 34%.',
    cta: 'Run Full Analysis', href: '/workspace?asset=AAPL' },
  { kind: 'tail', title: 'Tail Risk Elevated', asset: 'TSLA',
    body: 'TSLA 99% VaR widened 23% in last 24h. Tail score now 74/100.',
    cta: 'Re-run Simulation', href: '/workspace?asset=TSLA' },
  { kind: 'divergence', title: 'Regime Divergence', asset: 'BTC-USD',
    body: 'BTC-USD diverging from broader market regime. Historically precedes 2-week vol expansion.',
    cta: 'Inspect', href: '/regime' },
  { kind: 'vol', title: 'Vol Compression', asset: 'NVDA',
    body: 'NVDA realised vol at 12-week low. Mean reversion model suggests expansion within 9 trading days.',
    cta: 'Run Jump-Diffusion', href: '/workspace?asset=NVDA' },
  { kind: 'correlation', title: 'Correlation Spike',
    body: 'Cross-asset correlation rose to 0.71 — diversification benefit decaying. Review portfolio.',
    cta: 'Open Portfolio', href: '/portfolio' },
  { kind: 'regime', title: 'Regime Shift', asset: 'SPY',
    body: 'HMM detected transition from Low Vol → High Vol on SPY at 09:14 UTC. Confidence 87.3%.',
    cta: 'See Regime Monitor', href: '/regime' },
];

function makeCard(seedIdx: number, ageMs: number): FeedCard {
  const t = POOL[seedIdx % POOL.length];
  return {
    ...t,
    id: `${t.kind}-${seedIdx}-${ageMs}`,
    createdAt: Date.now() - ageMs,
    unread: ageMs < 5 * 60_000,
  };
}

export function useAIFeed() {
  const [cards, setCards] = useState<FeedCard[]>(() => [
    makeCard(0, 4 * 60_000),
    makeCard(1, 22 * 60_000),
    makeCard(2, 68 * 60_000),
    makeCard(3, 3 * 3600_000),
    makeCard(4, 7 * 3600_000),
  ]);

  useEffect(() => {
    let idx = 5;
    const schedule = () => {
      const delay = 45_000 + Math.random() * 45_000;
      return setTimeout(() => {
        setCards(prev => [makeCard(idx++, 0), ...prev].slice(0, 12));
        timer = schedule();
      }, delay);
    };
    let timer = schedule();
    return () => clearTimeout(timer);
  }, []);

  const markAllRead = () => setCards(prev => prev.map(c => ({ ...c, unread: false })));

  return { cards, markAllRead };
}

export function relativeTime(ms: number) {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}