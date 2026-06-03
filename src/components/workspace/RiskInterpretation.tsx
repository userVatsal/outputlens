import { useState, useEffect } from 'react';
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { EnhancedTradeAnalysis } from '@/types/analysis';
import { supabase } from '@/integrations/supabase/client';

interface RiskInterpretationProps {
  analysis: EnhancedTradeAnalysis;
}

function parseBulletPoints(text: string): string[] {
  const lines = text.split('\n').filter(line => line.trim());
  const bulletPatterns = [/^[-•*]\s+/, /^\d+\.\s+/, /^[→►▸]\s+/];
  const isBulletFormat = lines.some(line => bulletPatterns.some(pattern => pattern.test(line.trim())));

  if (isBulletFormat) {
    return lines
      .map(line => {
        let cleaned = line.trim();
        bulletPatterns.forEach(pattern => { cleaned = cleaned.replace(pattern, ''); });
        return cleaned.trim();
      })
      .filter(line => line.length > 0)
      .slice(0, 6);
  }

  return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20 && s.length < 200).slice(0, 6);
}

export function RiskInterpretation({ analysis }: RiskInterpretationProps) {
  const [bullets, setBullets] = useState<string[]>([]);
  const [fullExplanation, setFullExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    const fetchInterpretation = async () => {
      setIsLoading(true);
      setError(null);
      setBullets([]);

      try {
        const response = await supabase.functions.invoke('analyze-trade', {
          body: { analysis, format: 'bullets' },
        });

        if (response.error) throw new Error(response.error.message || 'Failed to get risk interpretation');

        if (response.data?.explanation) {
          const explanation = response.data.explanation;
          setFullExplanation(explanation);
          setBullets(parseBulletPoints(explanation));
        } else {
          throw new Error('No interpretation received');
        }
      } catch (err) {
        console.error('Risk interpretation error:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate interpretation');
        setBullets(generateFallbackInterpretation(analysis));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterpretation();
  }, [analysis]);

  return (
    <div className="rounded-2xl border border-border/50 bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-[13px] font-semibold text-foreground">AI Interpretation</span>
        </div>
        {analysis.riskMetrics.usedLiveData && (
          <span className="text-[10px] font-mono text-bullish font-bold uppercase tracking-wider bg-bullish/10 border border-bullish/20 px-1.5 py-0.5 rounded">
            Live
          </span>
        )}
      </div>

      <div className="p-5">
        {isLoading && (
          <div className="flex items-center gap-3 py-4 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
            <span className="text-sm font-mono">
              Analyzing {analysis.simulation.paths.toLocaleString()}-path simulation...
            </span>
          </div>
        )}

        {!isLoading && bullets.length > 0 && (
          <div className="space-y-3">
            {bullets.map((bullet, index) => (
              <div key={index} className="flex items-start gap-3">
                {/* Left accent line */}
                <div className="w-0.5 self-stretch bg-primary/40 rounded-full flex-shrink-0 mt-1" />
                <p className="text-sm text-foreground/90 leading-relaxed">{bullet}</p>
              </div>
            ))}
          </div>
        )}

        {!isLoading && fullExplanation && (
          <div className="mt-4">
            <button
              onClick={() => setShowFull(!showFull)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              {showFull ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {showFull ? 'Hide detailed analysis' : 'View full analysis'}
            </button>

            {showFull && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="space-y-2 leading-relaxed text-sm text-foreground/80">
                  {fullExplanation.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function generateFallbackInterpretation(analysis: EnhancedTradeAnalysis): string[] {
  const bullets: string[] = [];
  const { riskMetrics, scenarios } = analysis;

  if (riskMetrics.probabilityOfProfit >= 60) {
    bullets.push(`Positive expectancy with ${riskMetrics.probabilityOfProfit.toFixed(0)}% probability of profit`);
  } else if (riskMetrics.probabilityOfProfit >= 45) {
    bullets.push(`Moderate probability of profit at ${riskMetrics.probabilityOfProfit.toFixed(0)}% — requires careful position sizing`);
  } else {
    bullets.push(`Below 50% win probability — thesis conviction and risk management are critical`);
  }

  if (riskMetrics.expectedReturn > 0) {
    bullets.push(`Expected return of ${riskMetrics.expectedReturn.toFixed(1)}% provides positive mathematical edge`);
  } else {
    bullets.push(`Negative expected return of ${riskMetrics.expectedReturn.toFixed(1)}% — consider alternative entries`);
  }

  if (riskMetrics.riskScore <= 3) {
    bullets.push(`Low risk profile (${riskMetrics.riskScore}/10) — suitable for standard position sizes`);
  } else if (riskMetrics.riskScore <= 6) {
    bullets.push(`Medium risk profile (${riskMetrics.riskScore}/10) — moderate position sizing recommended`);
  } else {
    bullets.push(`High risk profile (${riskMetrics.riskScore}/10) — reduce position size to limit exposure`);
  }

  bullets.push(`95% of outcomes fall within ${Math.abs(riskMetrics.valueAtRisk95).toFixed(1)}% of entry — plan stops accordingly`);

  const tailProb = scenarios.tail.reduce((sum, s) => sum + (s.probability > 1 ? s.probability : s.probability * 100), 0);
  if (tailProb > 2) {
    bullets.push(`Elevated tail risk at ${tailProb.toFixed(1)}% — extreme outcomes more likely than normal distribution suggests`);
  } else {
    bullets.push(`Tail risk at ${tailProb.toFixed(1)}% is within normal parameters`);
  }

  if (analysis.simulation.kurtosis > 1) {
    bullets.push(`Fat tails detected (kurtosis ${analysis.simulation.kurtosis.toFixed(2)}) — outlier events more probable`);
  }

  return bullets.slice(0, 6);
}
