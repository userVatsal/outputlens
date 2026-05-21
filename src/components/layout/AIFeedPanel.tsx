import { Link } from 'react-router-dom';
import { Sparkles, X, PanelRightOpen } from 'lucide-react';
import { useAIFeed, relativeTime, type FeedCard } from '@/hooks/useAIFeed';
import { cn } from '@/lib/utils';

const KIND_STYLE: Record<FeedCard['kind'], { dot: string; label: string }> = {
  regime:      { dot: 'hsl(var(--accent))',  label: 'Regime' },
  vol:         { dot: 'hsl(var(--primary))', label: 'Volatility' },
  divergence:  { dot: 'hsl(var(--accent))',  label: 'Divergence' },
  tail:        { dot: 'hsl(var(--destructive))', label: 'Tail Risk' },
  correlation: { dot: 'hsl(var(--caution))', label: 'Correlation' },
};

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export function AIFeedPanel({ collapsed, onToggle }: Props) {
  const { cards, markAllRead } = useAIFeed();
  const unreadCount = cards.filter(c => c.unread).length;

  if (collapsed) {
    return (
      <button
        onClick={onToggle}
        aria-label="Open AI feed"
        className="hidden lg:flex fixed top-20 right-0 z-30 flex-col items-center justify-center w-9 py-3 rounded-l-md bg-elevated border border-r-0 border-border/60 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Sparkles className="h-4 w-4" style={{ color: 'hsl(var(--accent))' }} />
        {unreadCount > 0 && (
          <span
            className="mt-1 text-[10px] font-mono font-bold px-1 rounded"
            style={{ background: 'hsl(var(--accent) / 0.15)', color: 'hsl(var(--accent))' }}
          >
            {unreadCount}
          </span>
        )}
        <span className="mt-2 text-[10px] uppercase tracking-widest" style={{ writingMode: 'vertical-rl' }}>
          AI Feed
        </span>
      </button>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col fixed top-14 right-0 bottom-0 z-30 w-[320px] border-l border-border/60 bg-surface">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="relative flex items-center justify-center w-5 h-5">
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-60"
              style={{ background: 'hsl(var(--accent) / 0.4)' }}
            />
            <Sparkles className="h-4 w-4 relative" style={{ color: 'hsl(var(--accent))' }} />
          </span>
          <h2 className="text-sm font-semibold text-foreground">AI Intelligence Feed</h2>
        </div>
        <button
          onClick={onToggle}
          aria-label="Collapse AI feed"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Sub-header */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-border/60">
        <span className="text-[11px] text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount} new signal${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
        </span>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-[11px] text-primary hover:underline">
            Mark all read
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {cards.map((card, i) => {
          const meta = KIND_STYLE[card.kind];
          return (
            <div
              key={card.id}
              className={cn(
                'relative rounded-lg border bg-elevated/60 p-3 transition-all',
                card.unread ? 'border-border' : 'border-border/40 opacity-90',
                i === 0 && card.unread && 'animate-fade-in',
              )}
              style={card.unread ? { borderLeftWidth: 2, borderLeftColor: 'hsl(var(--primary))' } : undefined}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }} />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{meta.label}</span>
                {card.asset && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-background border border-border/60 text-foreground ml-auto">
                    {card.asset}
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold text-foreground mb-1">{card.title}</div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{card.body}</p>
              <div className="flex items-center justify-between">
                <Link
                  to={card.href}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: 'hsl(var(--primary))' }}
                >
                  {card.cta} →
                </Link>
                <span className="text-[10px] text-muted-foreground font-mono">{relativeTime(card.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}