import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { JournalEntry as Entry } from '@/hooks/useJournal';

function DirBadge({ dir }: { dir: 'long' | 'short' }) {
  const bull = dir === 'long';
  return (
    <span className={cn(
      'font-mono text-[10px] font-semibold uppercase rounded-md px-2 py-0.5 border',
      bull
        ? 'bg-bullish/8 border-bullish/20 text-bullish'
        : 'bg-bearish/8 border-bearish/20 text-bearish'
    )}>
      {dir}
    </span>
  );
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtPct(v: number | null | undefined) {
  if (v == null) return '—';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}%`;
}

function MetricCell({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{label}</div>
      <div className={cn('font-mono font-semibold text-[15px] mt-0.5', tone)}>{value}</div>
    </div>
  );
}

interface Props {
  entry: Entry;
  onClose?: (entry: Entry) => void;
  onDelete?: (id: string) => void;
}

export function JournalEntryCard({ entry, onClose, onDelete }: Props) {
  const isClosed = entry.status === 'closed';
  const actual = entry.actual_return_pct ?? 0;
  const withinVar = entry.var95_at_entry != null
    ? actual >= -Math.abs(entry.var95_at_entry)
    : null;

  return (
    <div className="rounded-xl bg-surface border border-border/50 p-5 hover:border-primary/15 transition-all">
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-[16px] text-foreground">{entry.asset}</span>
        <DirBadge dir={entry.direction} />
        <span className="ml-auto text-[11px] font-mono text-muted-foreground">{fmtDate(entry.entry_date)}</span>
      </div>

      <div className="grid grid-cols-4 gap-3 mt-3">
        <MetricCell label="Entry" value={`$${entry.entry_price.toFixed(2)}`} tone="text-foreground" />
        <MetricCell
          label="VaR 95%"
          value={entry.var95_at_entry != null ? `${entry.var95_at_entry.toFixed(1)}%` : '—'}
          tone="text-bearish"
        />
        <MetricCell
          label="Win Prob"
          value={entry.win_prob_at_entry != null ? `${entry.win_prob_at_entry.toFixed(0)}%` : '—'}
          tone="text-foreground"
        />
        <MetricCell
          label="Risk Score"
          value={entry.risk_score_at_entry != null ? entry.risk_score_at_entry.toFixed(1) : '—'}
          tone="text-foreground"
        />
      </div>

      {entry.thesis && (
        <p className="italic text-[13px] text-muted-foreground/80 leading-relaxed border-t border-border/30 pt-3 mt-3 line-clamp-2">
          {entry.thesis}
        </p>
      )}

      {isClosed && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
          <div className={cn(
            'font-mono font-bold text-[20px] tabular-nums',
            actual >= 0 ? 'text-bullish' : 'text-bearish'
          )}>
            {actual >= 0 ? '▲' : '▼'} {fmtPct(actual)}
          </div>
          {withinVar !== null && (
            <span className={cn(
              'text-[10px] font-mono px-2 py-0.5 rounded-md',
              withinVar ? 'bg-bullish/8 text-bullish' : 'bg-bearish/8 text-bearish'
            )}>
              {withinVar ? 'Within VaR ✓' : 'Exceeded VaR'}
            </span>
          )}
          {entry.actual_pnl != null && (
            <span className={cn('ml-auto font-mono text-[13px]', entry.actual_pnl >= 0 ? 'text-bullish' : 'text-bearish')}>
              {entry.actual_pnl >= 0 ? '+' : '-'}${Math.abs(entry.actual_pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-4 mt-3">
        {!isClosed && onClose && (
          <button
            type="button"
            onClick={() => onClose(entry)}
            className="text-[12px] text-primary hover:underline font-medium"
          >
            Close Trade →
          </button>
        )}
        <Link
          to={`/workspace?asset=${entry.asset}&market=${entry.market}&direction=${entry.direction}`}
          className="text-[12px] text-primary hover:underline"
        >
          Re-analyse
        </Link>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            className="text-[12px] text-muted-foreground hover:text-bearish"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}