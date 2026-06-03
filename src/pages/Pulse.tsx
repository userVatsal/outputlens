import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { useTrackedAssets } from '@/hooks/useTrackedAssets';
import { useMarketStatus, formatCountdown } from '@/hooks/useMarketStatus';
import { PulseTile } from '@/components/pulse/PulseTile';
import { Radar, RefreshCw } from 'lucide-react';

function MarketPillStandalone() {
  const { state, minutesToOpen } = useMarketStatus();
  const map = {
    open:   { color: 'hsl(var(--bullish))',     label: 'NYSE OPEN' },
    pre:    { color: 'hsl(var(--accent))',      label: 'PRE-MARKET' },
    after:  { color: 'hsl(var(--caution))',     label: 'AFTER HOURS' },
    closed: { color: 'hsl(var(--muted-foreground))', label: 'NYSE CLOSED' },
  }[state];
  return (
    <div className="flex items-center gap-2 px-3 h-8 rounded-lg bg-elevated border border-border/50 text-[11px] font-mono font-medium tracking-wide">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: map.color, boxShadow: `0 0 6px ${map.color}` }} />
      <span className="text-foreground">{map.label}</span>
      {state !== 'open' && minutesToOpen > 0 && (
        <span className="text-muted-foreground">· opens in {formatCountdown(minutesToOpen)}</span>
      )}
    </div>
  );
}

export default function Pulse() {
  const { trackedAssets, refresh } = useTrackedAssets();
  const { state } = useMarketStatus();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [tick, setTick] = useState(0);

  useEffect(() => { document.title = 'Risk Pulse | OutputLens'; }, []);

  useEffect(() => {
    const id = setInterval(() => {
      refresh();
      setLastUpdated(new Date());
      setTick(t => t + 1);
    }, 180_000);
    return () => clearInterval(id);
  }, [refresh]);

  const sorted = useMemo(() => {
    return [...trackedAssets].filter(a => a.status === 'active').sort((a, b) => {
      const dd = (b.risk_delta ?? 0) - (a.risk_delta ?? 0);
      if (dd !== 0) return dd;
      return a.symbol.localeCompare(b.symbol);
    });
  }, [trackedAssets]);

  const elevated = sorted.filter(a => (a.risk_delta ?? 0) > 0.10).length;
  const avgVar = sorted.length > 0 ? sorted.reduce((s, a) => s + (a.current_var95 ?? 0), 0) / sorted.length : 0;
  const timeStr = lastUpdated.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto flex flex-col" style={{ minHeight: 'calc(100vh - 8rem)' }}>
        <div className="h-12 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-primary" />
            <h1 className="font-display font-bold text-[20px]">Risk Pulse</h1>
            {state === 'open' && <span className="dot-live ml-1" />}
          </div>
          <div className="flex items-center gap-3">
            <MarketPillStandalone />
            <span className="font-mono text-[11px] text-muted-foreground">Updated {timeStr}</span>
            <button onClick={() => { refresh(); setLastUpdated(new Date()); setTick(t => t+1); }} className="text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Radar className="h-16 w-16 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground text-[14px]">No positions tracked.</p>
              <Link to="/workspace" className="text-primary text-[13px] mt-2 hover:underline">Add your first via the workspace →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {sorted.map(a => <PulseTile key={`${a.id}-${tick}`} asset={a} />)}
            </div>
          )}
        </div>

        <div className="h-8 border-t border-border/30 flex items-center gap-6 mt-4 text-[11px] font-mono text-muted-foreground">
          <span>{sorted.length} positions</span>
          <span className={elevated > 0 ? 'text-bearish' : ''}>{elevated} elevated</span>
          <span>Avg VaR {avgVar.toFixed(1)}%</span>
          <span>Updated {timeStr}</span>
        </div>
      </div>
    </AppShell>
  );
}