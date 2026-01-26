import { useState, useEffect } from 'react';
import { Sparkles, Loader2, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { EnhancedTradeAnalysis } from '@/types/analysis';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface RiskInterpretationProps {
  analysis: EnhancedTradeAnalysis;
}

function parseBulletPoints(text: string): string[] {
  // Try to parse as bullet points
  const lines = text.split('\n').filter(line => line.trim());
  
  // Check if it's already in bullet format
  const bulletPatterns = [/^[-•*]\s+/, /^\d+\.\s+/, /^[→►▸]\s+/];
  const isBulletFormat = lines.some(line => 
    bulletPatterns.some(pattern => pattern.test(line.trim()))
  );

  if (isBulletFormat) {
    return lines
      .map(line => {
        // Remove bullet markers
        let cleaned = line.trim();
        bulletPatterns.forEach(pattern => {
          cleaned = cleaned.replace(pattern, '');
        });
        return cleaned.trim();
      })
      .filter(line => line.length > 0)
      .slice(0, 6); // Max 6 bullets
  }

  // If prose format, split into sentences and take key ones
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 200);
  
  return sentences.slice(0, 6);
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
          body: { 
            analysis,
            format: 'bullets' // Request bullet format
          },
        });

        if (response.error) {
          throw new Error(response.error.message || 'Failed to get risk interpretation');
        }

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
        
        // Fallback: generate basic interpretation from data
        const fallbackBullets = generateFallbackInterpretation(analysis);
        setBullets(fallbackBullets);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterpretation();
  }, [analysis]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Risk Interpretation</h3>
        {analysis.riskMetrics.usedLiveData && (
          <span className="ml-auto text-xs text-bullish">Using live market data</span>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 py-6 justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Analyzing {analysis.simulation.paths.toLocaleString()}-path simulation...</span>
        </div>
      )}

      {!isLoading && bullets.length > 0 && (
        <div className="space-y-2.5">
          {bullets.map((bullet, index) => (
            <div 
              key={index}
              className="flex items-start gap-2.5"
            >
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground/90 leading-relaxed">
                {bullet}
              </p>
            </div>
          ))}
        </div>
      )}

      {!isLoading && fullExplanation && (
        <>
          <button
            onClick={() => setShowFull(!showFull)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-4 transition-colors"
          >
            {showFull ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Hide detailed analysis
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                View detailed analysis
              </>
            )}
          </button>

          {showFull && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="prose prose-sm max-w-none text-foreground/80">
                <div className="space-y-2 leading-relaxed text-sm">
                  {fullExplanation.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Disclaimer */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          Analysis based on Monte Carlo simulation with {analysis.simulation.paths.toLocaleString()} paths. 
          Probabilities are derived from historical volatility and do not predict future outcomes. 
          This is not financial advice.
        </p>
      </div>
    </div>
  );
}

function generateFallbackInterpretation(analysis: EnhancedTradeAnalysis): string[] {
  const bullets: string[] = [];
  const { riskMetrics, scenarios } = analysis;

  // Win probability assessment
  if (riskMetrics.probabilityOfProfit >= 60) {
    bullets.push(`Positive expectancy with ${riskMetrics.probabilityOfProfit.toFixed(0)}% probability of profit`);
  } else if (riskMetrics.probabilityOfProfit >= 45) {
    bullets.push(`Moderate probability of profit at ${riskMetrics.probabilityOfProfit.toFixed(0)}% - requires careful position sizing`);
  } else {
    bullets.push(`Below 50% win probability - thesis conviction and risk management are critical`);
  }

  // Expected return
  if (riskMetrics.expectedReturn > 0) {
    bullets.push(`Expected return of ${riskMetrics.expectedReturn.toFixed(1)}% provides positive mathematical edge`);
  } else {
    bullets.push(`Negative expected return of ${riskMetrics.expectedReturn.toFixed(1)}% - consider alternative entries or thesis review`);
  }

  // Risk level
  if (riskMetrics.riskScore <= 3) {
    bullets.push(`Low risk profile (${riskMetrics.riskScore}/10) - suitable for larger position sizes`);
  } else if (riskMetrics.riskScore <= 6) {
    bullets.push(`Medium risk profile (${riskMetrics.riskScore}/10) - standard position sizing recommended`);
  } else {
    bullets.push(`High risk profile (${riskMetrics.riskScore}/10) - reduce position size accordingly`);
  }

  // VaR insight
  bullets.push(`95% of outcomes fall within ${Math.abs(riskMetrics.valueAtRisk95).toFixed(1)}% of entry - plan stops accordingly`);

  // Tail risk
  const tailProb = scenarios.tail.reduce((sum, s) => sum + (s.probability > 1 ? s.probability : s.probability * 100), 0);
  if (tailProb > 2) {
    bullets.push(`Elevated tail risk at ${tailProb.toFixed(1)}% - extreme outcomes more likely than normal distribution suggests`);
  } else {
    bullets.push(`Tail risk at ${tailProb.toFixed(1)}% is within normal parameters`);
  }

  // Kurtosis warning
  if (analysis.simulation.kurtosis > 1) {
    bullets.push(`Fat tails detected (kurtosis ${analysis.simulation.kurtosis.toFixed(2)}) - outlier events more probable`);
  }

  return bullets.slice(0, 6);
}
