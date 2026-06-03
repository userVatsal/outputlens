import { Link } from 'react-router-dom';
import { Download, RefreshCw } from 'lucide-react';
import { FanChart } from '@/components/landing/v2/FanChart';

/**
 * Monte Carlo distribution preview for the dashboard.
 * Uses the shared fan chart; renders compact stats below.
 */
export function PortfolioDistributionCard({ lastRunLabel = '2h ago' }: { lastRunLabel?: string }) {
  return (
    <section className="rounded-xl bg-surface border border-border/50 overflow-hidden">
      <div className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-border/40">
        <div>
          <h2 className="text-[13px] font-semibold text-foreground">Monte Carlo Distribution</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-mono tabular-nums">
            Last run {lastRunLabel} · 10,000 paths · 1M horizon
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/workspace"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-semibold text-[12px] h-9 px-3 hover:bg-primary/15 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Run Fresh
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border/60 text-foreground font-semibold text-[12px] h-9 px-3 hover:bg-elevated transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>
      <div className="p-3 md:p-5">
        <div className="hidden md:block"><FanChart height={300} /></div>
        <div className="md:hidden"><FanChart height={220} /></div>
      </div>
      <div className="px-5 py-3 border-t border-border/40 grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-[11px] uppercase text-muted-foreground tracking-[0.08em]">P5</div>
          <div className="font-mono font-semibold text-bearish text-[14px] mt-1 tabular-nums">−12.1%</div>
        </div>
        <div>
          <div className="text-[11px] uppercase text-muted-foreground tracking-[0.08em]">P50</div>
          <div className="font-mono font-semibold text-foreground text-[14px] mt-1 tabular-nums">+4.6%</div>
        </div>
        <div>
          <div className="text-[11px] uppercase text-muted-foreground tracking-[0.08em]">P95</div>
          <div className="font-mono font-semibold text-bullish text-[14px] mt-1 tabular-nums">+34.2%</div>
        </div>
      </div>
    </section>
  );
}