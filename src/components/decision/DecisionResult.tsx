import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { EnhancedTradeAnalysis } from '@/types/analysis';
import { formatCurrencyWithSign, calculatePnL, investmentToShares } from '@/lib/positionCalculations';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface DecisionResultProps {
  analysis: EnhancedTradeAnalysis;
  onSave: () => void;
  onClose: () => void;
}

export function DecisionResult({ analysis, onSave, onClose }: DecisionResultProps) {
  const [stressMode, setStressMode] = useState(false);
  const [explanation, setExplanation] = useState<string[]>([]);
  const [explanationLoading, setExplanationLoading] = useState(true);

  const { riskMetrics, scenarios, input, simulation } = analysis;
  
  // Calculate shares from position
  const shares = input.positionType === 'dollars' && input.positionSize
    ? investmentToShares(input.positionSize, input.entryPrice)
    : (input.positionSize || 1);

  // 5% worst case loss (VaR 95)
  const worstCasePct = Math.abs(riskMetrics.valueAtRisk95);
  const worstCaseDollar = calculatePnL(input.entryPrice, -worstCasePct, shares);
  
  // Probability of loss
  const probLoss = 100 - riskMetrics.probabilityOfProfit;
  
  // Expected P&L (based on expected return)
  const expectedReturnPct = riskMetrics.expectedReturn;
  const expectedPnL = calculatePnL(input.entryPrice, expectedReturnPct, shares);
  
  // Expected drawdown (median negative outcome)
  const expectedDrawdownPct = Math.abs(riskMetrics.expectedShortfall);
  const expectedDrawdown = calculatePnL(input.entryPrice, -expectedDrawdownPct, shares);

  // Stress scenario - worst tail scenario
  const worstTail = scenarios.tail.reduce((worst, s) => {
    const returnVal = Math.min(s.returnRangeMin, s.returnRangeMax);
    return returnVal < worst.returnRangeMin ? s : worst;
  }, scenarios.tail[0] || { returnRangeMin: -50, returnRangeMax: -30 } as any);
  
  const stressLossPct = Math.abs(worstTail.returnRangeMin);
  const stressLoss = calculatePnL(input.entryPrice, -stressLossPct, shares);

  // Fetch plain English explanation
  useEffect(() => {
    const fetchExplanation = async () => {
      setExplanationLoading(true);
      try {
        const response = await supabase.functions.invoke('analyze-trade', {
          body: { analysis, format: 'bullets' },
        });

        if (response.data?.explanation) {
          // Parse into short sentences
          const text = response.data.explanation;
          const sentences = text
            .split(/[.!?]+/)
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 15 && s.length < 150)
            .slice(0, 3);
          setExplanation(sentences);
        }
      } catch {
        // Fallback explanation
        setExplanation([
          `Risk is ${riskMetrics.riskLabel.toLowerCase()} with ${probLoss.toFixed(0)}% chance of loss`,
          `In similar volatility conditions, outcomes cluster around ${riskMetrics.expectedReturn > 0 ? 'modest gains' : 'losses'}`,
          `Position sizing should reflect the ${worstCasePct.toFixed(1)}% VaR threshold`
        ]);
      }
      setExplanationLoading(false);
    };

    fetchExplanation();
  }, [analysis]);

  const displayedLoss = stressMode ? stressLoss : worstCaseDollar;
  const displayedPct = stressMode ? stressLossPct : worstCasePct;

  return (
    <div className="space-y-6">
      {/* Context line */}
      <p className="text-xs text-muted-foreground text-center">
        Based on probabilistic scenarios, not predictions
      </p>

      {/* Hero number - THE product */}
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground mb-2">
          Worst-case loss {stressMode ? '(stress)' : '(5% probability)'}
        </p>
        <p className="risk-number">
          {formatCurrencyWithSign(displayedLoss.totalPnl, '$')}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {displayedPct.toFixed(1)}% of position
        </p>
      </div>

      {/* Supporting metrics */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-muted-foreground mb-1 text-xs">Probability of loss</p>
          <p className="text-lg font-semibold font-mono">{probLoss.toFixed(0)}%</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-muted-foreground mb-1 text-xs">Expected P&L</p>
          <p className={cn(
            "text-lg font-semibold font-mono",
            expectedPnL.totalPnl >= 0 ? "text-bullish" : "text-bearish"
          )}>
            {formatCurrencyWithSign(expectedPnL.totalPnl, '$')}
          </p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-muted-foreground mb-1 text-xs">Max drawdown</p>
          <p className="text-lg font-semibold font-mono">
            {formatCurrencyWithSign(expectedDrawdown.totalPnl, '$')}
          </p>
        </div>
      </div>

      {/* Stress toggle */}
      <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
        <Checkbox
          id="stress"
          checked={stressMode}
          onCheckedChange={(checked) => setStressMode(checked as boolean)}
        />
        <label 
          htmlFor="stress" 
          className="text-sm cursor-pointer flex-1"
        >
          <span className="font-medium">Stress this position</span>
          <span className="text-muted-foreground block text-xs">
            Show worst-case under volatility spike or regime shift
          </span>
        </label>
        {stressMode && (
          <span className="text-xs font-mono" style={{ color: 'hsl(var(--risk))' }}>
            {formatCurrencyWithSign(stressLoss.totalPnl, '$')}
          </span>
        )}
      </div>

      {/* Plain English explanation */}
      <div className="space-y-2 p-4 rounded-lg bg-muted/30">
        {explanationLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing...
          </div>
        ) : (
          <div className="space-y-2 text-sm text-foreground/80">
            {explanation.map((sentence, i) => (
              <p key={i}>{sentence}.</p>
            ))}
          </div>
        )}
      </div>

      {/* Decision buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button
          onClick={onSave}
          className="py-5"
        >
          Save this decision
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
          className="py-5"
        >
          Close
        </Button>
      </div>
    </div>
  );
}
