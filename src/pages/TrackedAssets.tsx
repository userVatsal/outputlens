import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bookmark, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Trash2, 
  Pause, 
  Play,
  BarChart3,
  Loader2,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Link } from 'react-router-dom';

function RiskDeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null || delta === 0) {
    return <Badge variant="outline" className="text-muted-foreground">No change</Badge>;
  }
  
  const isIncrease = delta > 0;
  return (
    <Badge 
      variant={isIncrease ? "destructive" : "default"}
      className={cn(!isIncrease && "bg-emerald-500 hover:bg-emerald-600")}
    >
      {isIncrease ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
      {isIncrease ? '+' : ''}{delta.toFixed(1)} pts
    </Badge>
  );
}

function TrackedAssetCard({ 
  asset, 
  onUntrack, 
  onTogglePause 
}: { 
  asset: TrackedAsset;
  onUntrack: (id: string) => void;
  onTogglePause: (id: string, paused: boolean) => void;
}) {
  const isPaused = asset.status === 'paused';

  return (
    <Card className={cn(isPaused && "opacity-60")}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {asset.symbol}
              {isPaused && <Badge variant="secondary" className="text-xs">Paused</Badge>}
            </CardTitle>
            <CardDescription>
              {asset.asset_name || asset.market} • {asset.direction === 'long' ? 'Long' : 'Short'}
            </CardDescription>
          </div>
          <RiskDeltaBadge delta={asset.risk_delta} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">Entry Price</div>
            <div className="font-medium">${asset.entry_price.toFixed(2)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Frequency</div>
            <div className="font-medium capitalize">{asset.track_frequency}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Risk at Track</div>
            <div className="font-medium">{asset.risk_score_at_track?.toFixed(1) ?? '—'}/10</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Current Risk</div>
            <div className="font-medium">{asset.current_risk_score?.toFixed(1) ?? '—'}/10</div>
          </div>
        </div>

        {/* Threshold Warning */}
        {asset.risk_delta !== null && Math.abs(asset.risk_delta) >= asset.risk_threshold_delta && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 text-amber-600 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Threshold breached ({asset.risk_threshold_delta} pts)</span>
          </div>
        )}

        {/* Last Analyzed */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {asset.last_analysis_at 
            ? `Last analyzed ${formatDistanceToNow(new Date(asset.last_analysis_at), { addSuffix: true })}`
            : 'Never analyzed'
          }
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to={`/workspace?asset=${asset.symbol}&market=${asset.market}`}>
              <BarChart3 className="h-4 w-4 mr-1.5" />
              Analyze
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onTogglePause(asset.id, !isPaused)}
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
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
                <AlertDialogAction onClick={() => onUntrack(asset.id)}>
                  Untrack
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TrackedAssets() {
  const navigate = useNavigate();
  const { trackedAssets, isLoading, untrackAsset, updateTrackSettings } = useTrackedAssets();
  const [user, setUser] = useState<boolean>(false);

  useEffect(() => {
    document.title = 'Tracked Assets - Risk Monitoring | OutputLens';
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(true);
      }
    });
  }, [navigate]);

  const handleUntrack = async (id: string) => {
    await untrackAsset(id);
  };

  const handleTogglePause = async (id: string, pause: boolean) => {
    await updateTrackSettings(id, { status: pause ? 'paused' : 'active' });
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const activeAssets = trackedAssets.filter(a => a.status === 'active');
  const pausedAssets = trackedAssets.filter(a => a.status === 'paused');

  return (
    <Layout>
      <div className="section-container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/workspace">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Bookmark className="h-6 w-6 text-primary" />
                  Tracked Assets
                </h1>
                <p className="text-muted-foreground">
                  Monitor risk changes across your positions
                </p>
              </div>
            </div>
            <Button asChild>
              <Link to="/workspace">
                <BarChart3 className="h-4 w-4 mr-2" />
                New Analysis
              </Link>
            </Button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : trackedAssets.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Tracked Assets</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Start tracking assets from your analysis results to receive automated risk monitoring and alerts.
                </p>
                <Button asChild>
                  <Link to="/workspace">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Run Your First Analysis
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Active Assets */}
              {activeAssets.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Active ({activeAssets.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeAssets.map((asset) => (
                      <TrackedAssetCard
                        key={asset.id}
                        asset={asset}
                        onUntrack={handleUntrack}
                        onTogglePause={handleTogglePause}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Paused Assets */}
              {pausedAssets.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                    Paused ({pausedAssets.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pausedAssets.map((asset) => (
                      <TrackedAssetCard
                        key={asset.id}
                        asset={asset}
                        onUntrack={handleUntrack}
                        onTogglePause={handleTogglePause}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
