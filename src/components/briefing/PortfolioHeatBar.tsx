import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrackedAsset } from '@/hooks/useTrackedAssets';

function segmentColor(delta: number | null | undefined): string {
  const d = delta ?? 0;
  if (d > 0.10) return 'hsl(var(--bearish))';
  if (d > 0.05) return 'hsl(var(--caution))';
  if (d >= 0) return 'hsl(var(--primary) / 0.6)';
  return 'hsl(var(--bullish))';
}

export function PortfolioHeatBar({ assets }: { assets: TrackedAsset[] }) {
  const totalSize = assets.reduce((s, a) => s + (a.position_size ?? 1), 0) || 1;

  return (
    <div className="mt-5">
      <div className="h-[10px] w-full rounded-full overflow-hidden flex bg-elevated">
        <TooltipProvider delayDuration={120}>
          {assets.map(a => {
            const w = ((a.position_size ?? 1) / totalSize) * 100;
            const d = a.risk_delta ?? 0;
            return (
              <Tooltip key={a.id}>
                <TooltipTrigger asChild>
                  <div
                    className="h-full hover:brightness-125 transition-all cursor-pointer"
                    style={{ width: `${w}%`, background: segmentColor(d), minWidth: '4px' }}
                  />
                </TooltipTrigger>
                <TooltipContent className="font-mono text-[11px]">
                  {a.symbol} · Δ {d > 0 ? '+' : ''}{(d * 100).toFixed(1)}% since tracked
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
      <div className="flex items-center gap-4 mt-3 text-[10px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-bullish" /> Improving</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary/60" /> Stable</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-caution" /> Drifting</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-bearish" /> Elevated</span>
      </div>
    </div>
  );
}