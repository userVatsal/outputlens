import { useState } from 'react';
import { Bookmark, Bell, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { EnhancedTradeAnalysis } from '@/types/analysis';
import { useTrackedAssets } from '@/hooks/useTrackedAssets';
import { usePlan } from '@/hooks/usePlan';
import { cn } from '@/lib/utils';

interface TrackAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: EnhancedTradeAnalysis;
  onSuccess?: () => void;
}

type TrackFrequency = 'daily' | 'weekly' | 'monthly';

const frequencyOptions: { value: TrackFrequency; label: string; description: string; pro?: boolean }[] = [
  { value: 'daily', label: 'Daily', description: 'Re-analyze every 24 hours', pro: true },
  { value: 'weekly', label: 'Weekly', description: 'Re-analyze every 7 days' },
  { value: 'monthly', label: 'Monthly', description: 'Re-analyze every 30 days' },
];

export function TrackAssetModal({ open, onOpenChange, analysis, onSuccess }: TrackAssetModalProps) {
  const { trackAsset, isTracking, isAssetTracked } = useTrackedAssets();
  const { plan } = usePlan();
  const isPro = plan !== 'free';

  const [frequency, setFrequency] = useState<TrackFrequency>('weekly');
  const [thresholdDelta, setThresholdDelta] = useState(2);
  const [alertOnChange, setAlertOnChange] = useState(true);
  const [notes, setNotes] = useState('');

  const existingTrack = isAssetTracked(analysis.input.asset, analysis.input.market);

  const handleTrack = async () => {
    const success = await trackAsset({
      analysis,
      frequency,
      thresholdDelta,
      alertOnChange,
      notes: notes.trim() || undefined,
    });

    if (success) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            Track {analysis.input.asset}
          </DialogTitle>
          <DialogDescription>
            {existingTrack 
              ? 'Update tracking settings for this asset'
              : 'Get automated risk monitoring and alerts when conditions change'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Asset Summary */}
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Direction:</span>{' '}
                <span className="font-medium capitalize">{analysis.input.direction}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Entry:</span>{' '}
                <span className="font-medium">${analysis.input.entryPrice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Risk Score:</span>{' '}
                <span className="font-medium">{analysis.riskMetrics.riskScore}/10</span>
              </div>
              <div>
                <span className="text-muted-foreground">Win Prob:</span>{' '}
                <span className="font-medium">{analysis.riskMetrics.probabilityOfProfit.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Frequency Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Monitoring Frequency
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {frequencyOptions.map((option) => {
                const isDisabled = option.pro && !isPro;
                return (
                  <button
                    key={option.value}
                    onClick={() => !isDisabled && setFrequency(option.value)}
                    disabled={isDisabled}
                    className={cn(
                      "relative rounded-lg border p-3 text-left transition-all",
                      frequency === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{option.description}</div>
                    {option.pro && !isPro && (
                      <span className="absolute -top-1 -right-1 text-[8px] px-1 py-0.5 bg-primary text-primary-foreground rounded font-medium">
                        PRO
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alert Threshold */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              Alert Threshold
            </Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Alert if risk score changes by:</span>
                <span className="font-medium">{thresholdDelta} points</span>
              </div>
              <Slider
                value={[thresholdDelta]}
                onValueChange={([value]) => setThresholdDelta(value)}
                min={1}
                max={5}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Sensitive (1)</span>
                <span>Moderate (5)</span>
              </div>
            </div>
          </div>

          {/* Alert Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="alert-toggle" className="flex items-center gap-2 cursor-pointer">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Risk Change Alerts</div>
                <div className="text-xs text-muted-foreground">Get notified when thresholds are breached</div>
              </div>
            </Label>
            <Switch
              id="alert-toggle"
              checked={alertOnChange}
              onCheckedChange={setAlertOnChange}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this position..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none h-20"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleTrack} disabled={isTracking}>
            {isTracking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Tracking...
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4 mr-2" />
                {existingTrack ? 'Update Tracking' : 'Start Tracking'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
