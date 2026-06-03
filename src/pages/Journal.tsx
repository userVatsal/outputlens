import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { JournalStats } from '@/components/journal/JournalStats';
import { JournalEntryCard } from '@/components/journal/JournalEntry';
import { useJournal, JournalEntry, NewJournalEntry } from '@/hooks/useJournal';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Loader2, BookOpen, Plus } from 'lucide-react';

function AddEntryModal({ open, onOpenChange, initial, onSubmit }: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  initial?: Partial<NewJournalEntry>;
  onSubmit: (e: NewJournalEntry) => Promise<boolean>;
}) {
  const [asset, setAsset] = useState(initial?.asset || '');
  const [direction, setDirection] = useState<'long' | 'short'>(initial?.direction || 'long');
  const [entryPrice, setEntryPrice] = useState<string>(initial?.entry_price?.toString() || '');
  const [size, setSize] = useState<string>(initial?.position_size?.toString() || '');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [thesis, setThesis] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [linked, setLinked] = useState<any>(null);

  useEffect(() => {
    if (!open) return;
    setAsset(initial?.asset || '');
    setDirection(initial?.direction || 'long');
    setEntryPrice(initial?.entry_price?.toString() || '');
    setSize(initial?.position_size?.toString() || '');
    setDate(new Date().toISOString().slice(0, 10));
    setThesis('');
    setLinked(initial?.var95_at_entry != null ? { ...initial } : null);
  }, [open, initial]);

  // Try to find a recent analysis for this symbol
  useEffect(() => {
    let ignore = false;
    if (!open || !asset || asset.length < 1) { setLinked(null); return; }
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const since = new Date(Date.now() - 86400000 * 2).toISOString();
        const { data } = await (supabase as any)
          .from('analysis_history')
          .select('id, results, created_at')
          .eq('user_id', session.user.id)
          .eq('asset', asset.toUpperCase())
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(1);
        if (ignore) return;
        if (data && data.length > 0) {
          const r = data[0].results;
          setLinked({
            analysis_id: data[0].id,
            var95_at_entry: r?.riskMetrics?.valueAtRisk95 ?? null,
            win_prob_at_entry: r?.riskMetrics?.probabilityOfProfit ?? null,
            expected_return_at_entry: r?.riskMetrics?.expectedReturn ?? null,
            risk_score_at_entry: r?.riskMetrics?.riskScore ?? null,
          });
        }
      } catch {/* noop */}
    })();
    return () => { ignore = true; };
  }, [open, asset]);

  const submit = async () => {
    if (!asset || !entryPrice) return;
    setBusy(true);
    const ok = await onSubmit({
      asset: asset.toUpperCase(),
      direction,
      entry_price: Number(entryPrice),
      position_size: size ? Number(size) : null,
      entry_date: new Date(date).toISOString(),
      thesis: thesis || null,
      ...(linked || {}),
    });
    setBusy(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-border/60 max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-display text-[20px]">Log a Trade</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Asset</Label>
            <Input
              value={asset}
              onChange={(e) => setAsset(e.target.value.toUpperCase())}
              placeholder="AAPL"
              className="font-mono h-11 mt-1.5 bg-elevated"
            />
          </div>
          <div className="flex gap-2">
            {(['long', 'short'] as const).map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDirection(d)}
                className={cn(
                  'flex-1 h-10 rounded-xl font-mono text-[12px] font-semibold uppercase border transition-all',
                  direction === d
                    ? d === 'long'
                      ? 'bg-bullish/15 border-bullish/30 text-bullish'
                      : 'bg-bearish/15 border-bearish/30 text-bearish'
                    : 'bg-elevated border-border/40 text-muted-foreground'
                )}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Entry price</Label>
              <Input type="number" step="0.01" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)}
                className="font-mono h-11 mt-1.5 bg-elevated" />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Size ($)</Label>
              <Input type="number" value={size} onChange={(e) => setSize(e.target.value)}
                className="font-mono h-11 mt-1.5 bg-elevated" placeholder="optional" />
            </div>
          </div>
          <div>
            <Label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Entry date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="font-mono h-11 mt-1.5 bg-elevated" />
          </div>
          <div>
            <Label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Thesis</Label>
            <Textarea
              value={thesis}
              onChange={(e) => setThesis(e.target.value.slice(0, 500))}
              placeholder="What's your edge on this trade?"
              className="mt-1.5 bg-elevated min-h-[80px]"
            />
            <p className="text-[10px] text-muted-foreground mt-1 font-mono">{thesis.length}/500</p>
          </div>

          {linked?.var95_at_entry != null && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-[12px] text-primary">
              ✓ Pulling risk metrics from your recent {asset} analysis
            </div>
          )}

          <button
            disabled={!asset || !entryPrice || busy}
            onClick={submit}
            className="w-full h-[46px] bg-primary text-primary-foreground rounded-xl font-semibold text-[14px] disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Log Trade'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CloseTradeModal({ entry, onOpenChange, onClose }: {
  entry: JournalEntry | null;
  onOpenChange: (b: boolean) => void;
  onClose: (id: string, exit: number, date: string, notes?: string) => Promise<boolean>;
}) {
  const open = !!entry;
  const [exitPrice, setExitPrice] = useState('');
  const [exitDate, setExitDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (entry) {
      setExitPrice('');
      setExitDate(new Date().toISOString().slice(0, 10));
      setNotes('');
    }
  }, [entry]);

  if (!entry) return null;
  const dirMult = entry.direction === 'short' ? -1 : 1;
  const live = exitPrice ? ((Number(exitPrice) - entry.entry_price) / entry.entry_price) * 100 * dirMult : null;

  const submit = async () => {
    if (!exitPrice) return;
    setBusy(true);
    const ok = await onClose(entry.id, Number(exitPrice), new Date(exitDate).toISOString(), notes || undefined);
    setBusy(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-border/60 max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="font-display text-[20px]">
            Close {entry.asset} <span className="text-muted-foreground font-mono text-[14px]">@ ${entry.entry_price.toFixed(2)}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Exit price</Label>
            <Input type="number" step="0.01" value={exitPrice} onChange={(e) => setExitPrice(e.target.value)}
              className="font-mono h-11 mt-1.5 bg-elevated" />
          </div>
          <div>
            <Label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Exit date</Label>
            <Input type="date" value={exitDate} onChange={(e) => setExitDate(e.target.value)}
              className="font-mono h-11 mt-1.5 bg-elevated" />
          </div>
          {live != null && (
            <div className={cn(
              'rounded-lg px-3 py-2 text-[13px] font-mono',
              live >= 0 ? 'bg-bullish/8 text-bullish' : 'bg-bearish/8 text-bearish'
            )}>
              If you exit at ${Number(exitPrice).toFixed(2)}: {live >= 0 ? '+' : ''}{live.toFixed(2)}%
            </div>
          )}
          <div>
            <Label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1.5 bg-elevated" placeholder="What happened?" />
          </div>
          <button
            disabled={!exitPrice || busy}
            onClick={submit}
            className="w-full h-[46px] bg-primary text-primary-foreground rounded-xl font-semibold text-[14px] disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Close Trade'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Journal() {
  const { openEntries, closedEntries, isLoading, addEntry, closeEntry, deleteEntry, stats } = useJournal();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<'open' | 'closed'>('open');
  const [addOpen, setAddOpen] = useState(false);
  const [closeTarget, setCloseTarget] = useState<JournalEntry | null>(null);
  const [prefill, setPrefill] = useState<Partial<NewJournalEntry> | undefined>(undefined);

  useEffect(() => { document.title = 'Risk Journal | OutputLens'; }, []);

  // Open the add modal automatically when ?new=1 is present
  useEffect(() => {
    if (params.get('new') === '1') {
      const p: Partial<NewJournalEntry> = {
        asset: params.get('asset') || undefined,
        direction: (params.get('direction') as 'long' | 'short') || undefined,
        entry_price: params.get('entry') ? Number(params.get('entry')) : undefined,
        var95_at_entry: params.get('var') ? Number(params.get('var')) : undefined,
        win_prob_at_entry: params.get('winp') ? Number(params.get('winp')) : undefined,
        expected_return_at_entry: params.get('exp') ? Number(params.get('exp')) : undefined,
      };
      setPrefill(p);
      setAddOpen(true);
      params.delete('new');
      setParams(params, { replace: true });
    }
    // mark journal opened today
    try { localStorage.setItem('ol_journal_last_check', new Date().toISOString()); } catch { /* noop */ }
  }, [params, setParams]);

  const list = tab === 'open' ? openEntries : closedEntries;

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-[28px] tracking-tight text-foreground flex items-center gap-2.5">
              <BookOpen className="h-6 w-6 text-primary" /> Risk Journal
            </h1>
            <p className="text-[14px] text-muted-foreground mt-1">Your personal record of trades, thesis, and outcomes.</p>
          </div>
          <button
            onClick={() => { setPrefill(undefined); setAddOpen(true); }}
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-xl px-5 h-[42px] font-semibold text-[13px]"
            style={{ boxShadow: '0 4px 16px hsl(var(--primary) / 0.3)' }}
          >
            <Plus className="h-4 w-4" /> Log Trade
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div>
            <div className="flex gap-1 mb-4">
              {(['open', 'closed'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'px-4 h-9 rounded-full text-[13px] font-medium transition-all border',
                    tab === t
                      ? 'bg-primary/10 border-primary/25 text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t === 'open' ? `Open · ${openEntries.length}` : `Closed · ${closedEntries.length}`}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : list.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/50 p-10 text-center bg-surface/50">
                <p className="text-muted-foreground text-[14px]">
                  No {tab} trades. {tab === 'open' && 'Log your first trade to start tracking your edge.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {list.map(e => (
                  <JournalEntryCard
                    key={e.id}
                    entry={e}
                    onClose={tab === 'open' ? (en) => setCloseTarget(en) : undefined}
                    onDelete={deleteEntry}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <JournalStats stats={stats} />
          </div>
        </div>
      </div>

      <AddEntryModal open={addOpen} onOpenChange={setAddOpen} initial={prefill} onSubmit={addEntry} />
      <CloseTradeModal entry={closeTarget} onOpenChange={(b) => !b && setCloseTarget(null)} onClose={closeEntry} />
    </AppShell>
  );
}