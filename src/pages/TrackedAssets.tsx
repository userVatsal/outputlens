import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Pause,
  Play,
  Trash2,
  BarChart3,
  Loader2,
  ArrowLeft,
  AlertTriangle,
  Bookmark,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTrackedAssets, TrackedAsset } from '@/hooks/useTrackedAssets';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

function RiskDelta({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-muted-foreground font-mono">—</span>;
  if (Math.abs(delta) < 0.05) return (
    <span className="flex items-center gap-1 text-muted-foreground font-mono text-sm">
      <Minus className="h-3 w-3" /> 0.0
    </span>
  );
  const isUp = delta > 0;
  return (
    <span className={cn(
      'flex items-center gap-0.5 font-mono text-sm font-semibold',
      isUp ? 'text-destructive' : 'text-bullish'
    )}>
      {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {isUp ? '+' : ''}{delta.toFixed(1)}
    </span>
  );
}

function StatusDot({ status }: { status: string | null }) {
  return (
    <span className={cn(
      'inline-block w-2 h-2 rounded-full flex-shrink-0',
      status === 'active' ? 'bg-bullish animate-pulse' : 'bg-muted-foreground'
    )} />
  );
}

export default function TrackedAssets() {
  const navigate = useNavigate();
  const { trackedAssets, isLoading, untrackAsset, updateTrackSettings } = useTrackedAssets();
  const [user, setUser] = useState<boolean>(false);

  useEffect(() => {
    document.title = 'Monitored Assets - Risk Tracking | OutputLens';
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/auth');
      else setUser(true);
    });
  }, [navigate]);

  const handleUntrack = async (id: string) => await untrackAsset(id);
  const handleTogglePause = async (id: string, pause: boolean) => {
    await updateTrackSettings(id, { status: pause ? 'paused' : 'active' });
  };

  if (!user) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="section-container py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2 font-display">
                  <Bookmark className="h-5 w-5 text-primary" />
                  MONITORED ASSETS
                </h1>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {trackedAssets.length} position{trackedAssets.length !== 1 ? 's' : ''} tracked
                </p>
              </div>
            </div>
            <Button asChild size="sm">
              <Link to="/workspace">
                <BarChart3 className="h-4 w-4 mr-2" />
                Run Analysis
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : trackedAssets.length === 0 ? (
            /* Empty state — terminal style */
            <div
              className="rounded-lg overflow-hidden border border-border"
              style={{ backgroundColor: 'hsl(var(--brand-navy))' }}
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <span className="w-3 h-3 rounded-full bg-white/20" />
                <span className="w-3 h-3 rounded-full bg-white/20" />
                <span className="w-3 h-3 rounded-full bg-white/20" />
                <span className="ml-3 text-white/40 text-xs font-mono">monitored-assets</span>
              </div>
              <div className="px-6 py-12 text-center">
                <p className="text-white/40 font-mono text-sm mb-1">&gt; No monitored assets found.</p>
                <p className="text-white/25 font-mono text-xs mb-6">&gt; Run an analysis to start tracking risk.</p>
                <Button asChild>
                  <Link to="/workspace">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Perform First Risk Analysis
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            /* Bloomberg-style data table */
            <div className="rounded-lg overflow-hidden border border-border">
              {/* Table header */}
              <div
                className="grid gap-0 px-4 py-2.5 border-b border-white/10"
                style={{
                  backgroundColor: 'hsl(var(--brand-navy))',
                  gridTemplateColumns: '1fr 1fr 90px 110px 110px 110px 90px 80px 140px',
                }}
              >
                {['SYMBOL', 'MARKET', 'DIR', 'ENTRY', 'RISK@TRACK', 'CURRENT', 'DELTA', 'STATUS', 'ACTIONS'].map((h) => (
                  <span key={h} className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{h}</span>
                ))}
              </div>

              {/* Rows */}
              <div className="divide-y divide-border">
                {trackedAssets.map((asset) => {
                  const isPaused = asset.status === 'paused';
                  const thresholdBreached = asset.risk_delta !== null &&
                    Math.abs(asset.risk_delta) >= (asset.risk_threshold_delta ?? 999);
                  return (
                    <div
                      key={asset.id}
                      className={cn(
                        'grid gap-0 px-4 py-3 items-center hover:bg-muted/30 transition-colors duration-100 group',
                        thresholdBreached && 'border-l-4 border-l-destructive',
                        isPaused && 'opacity-60',
                      )}
                      style={{
                        gridTemplateColumns: '1fr 1fr 90px 110px 110px 110px 90px 80px 140px',
                      }}
                    >
                      {/* Symbol */}
                      <div>
                        <span className="font-mono font-bold text-foreground text-sm">{asset.symbol}</span>
                        {asset.asset_name && (
                          <div className="text-[10px] text-muted-foreground truncate">{asset.asset_name}</div>
                        )}
                      </div>

                      {/* Market */}
                      <span className="text-sm text-muted-foreground font-mono">{asset.market}</span>

                      {/* Direction */}
                      <span className={cn(
                        'flex items-center gap-1 text-xs font-semibold font-mono',
                        asset.direction === 'long' ? 'text-bullish' : 'text-destructive'
                      )}>
                        {asset.direction === 'long'
                          ? <TrendingUp className="h-3.5 w-3.5" />
                          : <TrendingDown className="h-3.5 w-3.5" />}
                        {asset.direction.toUpperCase()}
                      </span>

                      {/* Entry */}
                      <span className="font-mono text-sm text-foreground">${asset.entry_price.toFixed(2)}</span>

                      {/* Risk at Track */}
                      <span className="font-mono text-sm text-muted-foreground">
                        {asset.risk_score_at_track?.toFixed(1) ?? '—'}/10
                      </span>

                      {/* Current Risk */}
                      <span className="font-mono text-sm text-foreground font-semibold">
                        {asset.current_risk_score?.toFixed(1) ?? '—'}/10
                      </span>

                      {/* Delta */}
                      <RiskDelta delta={asset.risk_delta} />

                      {/* Status */}
                      <div className="flex items-center gap-2">
                        <StatusDot status={asset.status} />
                        <span className="text-xs text-muted-foreground capitalize font-mono">
                          {asset.status ?? 'active'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          asChild
                        >
                          <Link to={`/workspace?asset=${asset.symbol}&market=${asset.market}`}>
                            Analyze
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleTogglePause(asset.id, !isPaused)}
                          title={isPaused ? 'Resume' : 'Pause'}
                        >
                          {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Untrack {asset.symbol}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will stop all risk monitoring and delete tracking history for this asset.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleUntrack(asset.id)}>Untrack</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legend */}
          {trackedAssets.length > 0 && (
            <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-full border-l-4 border-l-destructive h-3" />
                Threshold breached
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-bullish" />
                Active monitoring
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground" />
                Paused
              </span>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
