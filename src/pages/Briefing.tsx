import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { useTrackedAssets, TrackedAsset } from '@/hooks/useTrackedAssets';
import { useJournal } from '@/hooks/useJournal';
import { useMarketStatus, formatCountdown } from '@/hooks/useMarketStatus';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { BriefingCard } from '@/components/briefing/BriefingCard';
import { PortfolioHeatBar } from '@/components/briefing/PortfolioHeatBar';
import { cn } from '@/lib/utils';
import { Sunrise } from 'lucide-react';

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

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

function avg(arr: number[]) {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

export default function Briefing() {
  const { trackedAssets, isLoading } = useTrackedAssets();
  const { openEntries } = useJournal();
  const { profile } = useProfile();

  const [aiBullets, setAiBullets] = useState<string[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);

  useEffect(() => { document.title = 'Morning Briefing | OutputLens'; }, []);

  // Mark briefing as seen today
  useEffect(() => {
    try { localStorage.setItem(`ol_briefing_seen_${todayKey()}`, '1'); } catch { /* noop */ }
  }, []);

  const activeAssets = useMemo(() => trackedAssets.filter(a => a.status === 'active'), [trackedAssets]);
  const elevated = activeAssets.filter(a => (a.risk_delta ?? 0) > 0.10);
  const drifting = activeAssets.filter(a => (a.risk_delta ?? 0) > 0.05 && (a.risk_delta ?? 0) <= 0.10);
  const watchList = [...activeAssets]
    .filter(a => (a.risk_delta ?? 0) > 0.03)
    .sort((a, b) => (b.risk_delta ?? 0) - (a.risk_delta ?? 0))
    .slice(0, 3);

  const avgVar = avg(activeAssets.map(a => a.current_var95 ?? 0));
  const avgTail = avg(activeAssets.map(a => a.current_tail_risk ?? 0));

  // AI focus: cache per user per day
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      if (activeAssets.length === 0 && openEntries.length === 0) return;
      const key = `ol_briefing_${session.user.id}_${todayKey()}`;
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed.bullets)) {
            setAiBullets(parsed.bullets);
            setRefreshedAt(parsed.at);
            return;
          }
        }
      } catch { /* noop */ }

      setAiLoading(true);
      setAiError(null);
      try {
        const positions = activeAssets.slice(0, 6).map(a =>
          `${a.symbol} ${a.direction.toUpperCase()} VaR=${(a.current_var95 ?? 0).toFixed(1)}% delta=${((a.risk_delta ?? 0) * 100).toFixed(1)}%`
        ).join('; ');
        const trades = openEntries.slice(0, 6).map(e => {
          const days = Math.max(0, Math.round((Date.now() - new Date(e.entry_date).getTime()) / 86400000));
          return `${e.asset} ${e.direction.toUpperCase()} entered=${e.entry_price} ${days}d ago`;
        }).join('; ');
        const message = `Give me exactly 3 risk-focused bullet points for today. ` +
          `User's tracked positions: ${positions || 'none'}. ` +
          `Open journal trades: ${trades || 'none'}. ` +
          `Each bullet point: max 18 words. Start each with a verb. Be specific to these positions. No generic advice. Format: exactly 3 lines starting with •`;

        const { data, error } = await supabase.functions.invoke('claude-agent', {
          body: { message, mode: 'briefing' },
        });
        if (cancelled) return;
        if (error) throw error;
        const text = (data?.response || data?.text || data?.message || '') as string;
        const bullets = text
          .split(/\n+/)
          .map(l => l.trim())
          .filter(l => l.startsWith('•') || l.startsWith('-'))
          .map(l => l.replace(/^[•\-]\s*/, ''))
          .slice(0, 3);
        const finalBullets = bullets.length === 3
          ? bullets
          : text.split(/(?<=[.!?])\s+/).slice(0, 3).map(s => s.trim()).filter(Boolean);
        if (finalBullets.length > 0) {
          const at = new Date().toISOString();
          setAiBullets(finalBullets);
          setRefreshedAt(at);
          localStorage.setItem(key, JSON.stringify({ bullets: finalBullets, at }));
        } else {
          setAiError('No briefing returned.');
        }
      } catch (e: any) {
        if (!cancelled) setAiError(e?.message || 'Briefing unavailable.');
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeAssets, openEntries]);

  const date = new Date();
  const dateLine = date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .toUpperCase().replace(',', ' ·');

  const greeting = `Good morning, ${profile?.display_name || profile?.full_name?.split(' ')[0] || 'trader'}.`;

  const statusText = elevated.length > 0
    ? { text: `⚠ ${elevated.length} position${elevated.length > 1 ? 's' : ''} in elevated risk. Review before markets open.`, tone: 'text-bearish' }
    : drifting.length > 0
      ? { text: `↑ ${drifting.length} position${drifting.length > 1 ? 's' : ''} drifting higher risk.`, tone: 'text-caution' }
      : activeAssets.length > 0
        ? { text: 'All tracked positions within normal bounds.', tone: 'text-bullish' }
        : { text: 'No tracked positions yet. Start by analysing one in the Workspace.', tone: 'text-muted-foreground' };

  return (
    <AppShell>
      <div className="max-w-[820px] mx-auto py-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.12em]">{dateLine}</span>
          <MarketPillStandalone />
        </div>

        <h1 className="font-display font-extrabold text-[36px] tracking-tight text-foreground mt-4 flex items-center gap-3">
          <Sunrise className="h-8 w-8 text-primary" />
          {greeting}
        </h1>

        <p className={cn('mt-2 text-[15px] font-medium', statusText.tone)}>{statusText.text}{openEntries.length > 0 && ` · ${openEntries.length} open trades logged.`}</p>

        <BriefingCard
          title="Portfolio Risk Snapshot"
          meta={`as of ${new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`}
          className="mt-6"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
            {[
              { label: 'Avg VaR 95%', value: `${avgVar.toFixed(1)}%`, tone: 'text-foreground' },
              { label: 'Tail Risk', value: `${avgTail.toFixed(1)}%`, tone: 'text-bearish' },
              { label: 'Positions', value: `${activeAssets.length}`, tone: 'text-foreground' },
              { label: 'At Risk', value: `${drifting.length + elevated.length}`, tone: elevated.length > 0 ? 'text-bearish' : 'text-foreground' },
            ].map((c, i) => (
              <div key={c.label} className={cn('px-5', i < 3 && 'border-r border-border/30')}>
                <div className="text-[10px] uppercase font-mono text-muted-foreground tracking-[0.1em]">{c.label}</div>
                <div className={cn('font-mono font-bold text-[28px] tabular-nums mt-1', c.tone)}>{c.value}</div>
              </div>
            ))}
          </div>
          {activeAssets.length > 0 && <PortfolioHeatBar assets={activeAssets} />}
        </BriefingCard>

        {watchList.length > 0 && (
          <BriefingCard
            title="Positions to Watch"
            badge={<span className="bg-caution/10 border border-caution/20 text-caution font-mono text-[11px] rounded-md px-2 py-0.5">{watchList.length}</span>}
          >
            <div className="divide-y divide-border/30 -mt-2">
              {watchList.map(a => {
                const d = (a.risk_delta ?? 0) * 100;
                const tone = d > 10 ? 'text-bearish' : 'text-caution';
                return (
                  <div key={a.id} className="flex items-center gap-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-[15px] text-foreground">{a.symbol}</span>
                      <span className={cn(
                        'font-mono text-[10px] font-semibold uppercase rounded-md px-2 py-0.5 border',
                        a.direction === 'long'
                          ? 'bg-bullish/8 border-bullish/20 text-bullish'
                          : 'bg-bearish/8 border-bearish/20 text-bearish'
                      )}>{a.direction}</span>
                    </div>
                    <div className="flex-1">
                      <div className={cn('font-mono text-[13px]', tone)}>Risk up +{d.toFixed(1)}% since tracked</div>
                      <div className="font-mono text-[11px] text-muted-foreground">VaR 95%: {(a.current_var95 ?? 0).toFixed(1)}%</div>
                    </div>
                    <Link
                      to={`/workspace?asset=${a.symbol}&market=${a.market}&direction=${a.direction}`}
                      className="text-primary text-[13px] hover:underline flex-shrink-0"
                    >
                      Re-analyse →
                    </Link>
                  </div>
                );
              })}
            </div>
          </BriefingCard>
        )}

        <BriefingCard
          title="AI Risk Focus"
          accent="accent"
          badge={<span className="bg-accent/10 border border-accent/20 text-accent font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md">AI</span>}
        >
          {aiLoading && (
            <div className="space-y-2">
              {[0,1,2].map(i => <div key={i} className="h-5 rounded-full bg-elevated/60 animate-pulse" />)}
            </div>
          )}
          {!aiLoading && (aiBullets?.length ?? 0) > 0 && (
            <div className="space-y-3">
              {aiBullets!.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-[8px]" />
                  <p className="text-[14px] text-foreground leading-relaxed">{b}</p>
                </div>
              ))}
              {refreshedAt && (
                <p className="font-mono text-[10px] text-muted-foreground/60 mt-3">
                  Cached today · refreshes tomorrow
                </p>
              )}
            </div>
          )}
          {!aiLoading && (aiBullets?.length ?? 0) === 0 && (
            <p className="text-muted-foreground text-[13px] italic">
              {activeAssets.length === 0 && openEntries.length === 0
                ? 'Track positions to get a personalised daily briefing.'
                : (aiError || 'No AI briefing available right now.')}
            </p>
          )}
        </BriefingCard>

        {openEntries.length > 0 && (
          <BriefingCard
            title="Open Trades"
            badge={<span className="bg-primary/10 border border-primary/20 text-primary font-mono text-[11px] rounded-md px-2 py-0.5">{openEntries.length}</span>}
          >
            <div className="divide-y divide-border/30 -mt-2">
              {openEntries.slice(0, 5).map(e => {
                const days = Math.max(0, Math.round((Date.now() - new Date(e.entry_date).getTime()) / 86400000));
                return (
                  <Link
                    key={e.id}
                    to="/journal"
                    className="flex items-center gap-4 py-3 hover:bg-elevated/30 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <span className="font-mono font-semibold text-[14px] text-foreground">{e.asset}</span>
                    <span className={cn(
                      'font-mono text-[10px] font-semibold uppercase rounded-md px-2 py-0.5 border',
                      e.direction === 'long'
                        ? 'bg-bullish/8 border-bullish/20 text-bullish'
                        : 'bg-bearish/8 border-bearish/20 text-bearish'
                    )}>{e.direction}</span>
                    <span className="font-mono text-[12px] text-muted-foreground">@ ${e.entry_price.toFixed(2)}</span>
                    <span className="ml-auto font-mono text-[11px] text-muted-foreground">{days}d open</span>
                  </Link>
                );
              })}
            </div>
          </BriefingCard>
        )}

        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            to="/workspace"
            className="inline-flex items-center bg-primary text-primary-foreground rounded-xl h-[46px] px-6 font-semibold text-[14px]"
            style={{ boxShadow: '0 4px 20px hsl(var(--primary) / 0.3)' }}
          >+ Run Analysis</Link>
          <Link to="/tracked-assets" className="inline-flex items-center border border-border/50 rounded-xl h-[46px] px-6 text-foreground text-[14px] hover:border-foreground/20 transition-colors">View Positions</Link>
          <Link to="/journal" className="inline-flex items-center border border-border/50 rounded-xl h-[46px] px-6 text-foreground text-[14px] hover:border-foreground/20 transition-colors">Risk Journal</Link>
        </div>

        {isLoading && activeAssets.length === 0 && (
          <p className="text-center mt-8 text-muted-foreground text-[12px] font-mono">Loading positions…</p>
        )}
      </div>
    </AppShell>
  );
}