import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { TrackedAsset } from '@/hooks/useTrackedAssets';
import { useMarketData, LiveMarketData } from '@/hooks/useMarketData';
import { Market } from '@/types/trade';

interface Props { asset: TrackedAsset; }

export function PulseTile({ asset }: Props) {
  const [data, setData] = useState<LiveMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const { fetchMarketData } = useMarketData();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const d = await fetchMarketData(asset.symbol, asset.market as Market);
      if (!cancelled) { setData(d); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [asset.symbol, asset.market, fetchMarketData]);

  const d = asset.risk_delta ?? 0;
  const borderCls =
    d > 0.10 ? 'border-bearish/50 bg-bearish/[0.03]' :
    d > 0.05 ? 'border-caution/40' :
    d >= 0 ? 'border-border/60' :
    'border-bullish/30';

  const live = data?.price;
  const unrealizedPct = live != null
    ? ((live - asset.entry_price) / asset.entry_price) * 100 * (asset.direction === 'short' ? -1 : 1)
    : null;
  const change = data?.changePercent ?? 0;

  return (
    <div className={cn('group bg-surface border rounded-2xl p-4 flex flex-col gap-2 cursor-pointer hover:border-primary/30 transition-all', borderCls)}>
      <div className="flex items-baseline gap-2">
        <span className="font-mono font-bold text-[18px] text-foreground">{asset.symbol}</span>
        <span className={cn(
          'font-mono text-[10px] font-semibold uppercase rounded-md px-1.5 py-0.5 border',
          asset.direction === 'long'
            ? 'bg-bullish/8 border-bullish/20 text-bullish'
            : 'bg-bearish/8 border-bearish/20 text-bearish'
        )}>{asset.direction}</span>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto">{asset.market}</span>
      </div>

      {loading ? (
        <div className="space-y-1.5">
          <div className="h-5 w-24 rounded bg-elevated/60 animate-pulse" />
          <div className="h-3 w-16 rounded bg-elevated/60 animate-pulse" />
        </div>
      ) : (
        <div>
          <div className="font-mono font-semibold text-[22px] tabular-nums text-foreground">
            {live != null ? `$${live.toFixed(2)}` : '—'}
          </div>
          {change !== 0 && (
            <div className={cn('font-mono text-[12px]', change >= 0 ? 'text-bullish' : 'text-bearish')}>
              {change >= 0 ? '▲' : '▼'} {change.toFixed(2)}%
            </div>
          )}
        </div>
      )}

      <div className="font-mono text-[11px] text-muted-foreground">
        Entry: ${asset.entry_price.toFixed(2)}
        {unrealizedPct != null && (
          <span className={cn('ml-1', unrealizedPct >= 0 ? 'text-bullish' : 'text-bearish')}>
            ({unrealizedPct >= 0 ? '+' : ''}{unrealizedPct.toFixed(2)}%)
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1 mt-1 border-t border-border/30">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase">VaR 95%</div>
          <div className="font-mono font-semibold text-[13px] text-bearish">{(asset.current_var95 ?? 0).toFixed(1)}%</div>
        </div>
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase">Risk Δ</div>
          <div className={cn('font-mono font-semibold text-[13px]', d > 0 ? 'text-bearish' : d < 0 ? 'text-bullish' : 'text-muted-foreground')}>
            {d > 0 ? '+' : ''}{(d * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {d > 0.05 && (
        <div className="bg-caution/8 border border-caution/20 rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-caution">
          ⚠ Risk elevated +{(d * 100).toFixed(1)}%
        </div>
      )}

      <div className="flex items-center gap-2 text-[11px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
        <Link to={`/workspace?asset=${asset.symbol}&market=${asset.market}`} className="text-primary hover:underline">Analyse</Link>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">Close</span>
      </div>
    </div>
  );
}