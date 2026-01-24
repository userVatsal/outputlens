import { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { EnhancedTradeAnalysis } from '@/types/analysis';
import { supabase } from '@/integrations/supabase/client';

interface AIExplanationProps {
  analysis: EnhancedTradeAnalysis;
}

export function AIExplanation({ analysis }: AIExplanationProps) {
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExplanation = async () => {
      setIsLoading(true);
      setError(null);
      setExplanation('');

      try {
        const response = await supabase.functions.invoke('analyze-trade', {
          body: { analysis },
        });

        if (response.error) {
          throw new Error(response.error.message || 'Failed to get AI analysis');
        }

        if (response.data?.explanation) {
          setExplanation(response.data.explanation);
        } else {
          throw new Error('No explanation received');
        }
      } catch (err) {
        console.error('AI analysis error:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate explanation');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExplanation();
  }, [analysis]);

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Analysis</h3>
        {analysis.riskMetrics.usedLiveData && (
          <span className="ml-auto text-xs text-bullish">Using live market data</span>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 py-8 justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Analyzing {analysis.simulation.paths.toLocaleString()}-path simulation...</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-lg bg-bearish/10 border border-bearish/20 p-4">
          <AlertCircle className="h-5 w-5 text-bearish mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-bearish font-medium">Analysis unavailable</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && explanation && (
        <div className="prose prose-sm max-w-none text-foreground/90">
          <div className="space-y-3 leading-relaxed">
            {explanation.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-border/50">
        <p className="text-xs text-muted-foreground italic">
          ⚠️ This analysis is probabilistic based on Monte Carlo simulation. Markets are unpredictable. 
          This is not financial advice and no outcomes are guaranteed.
        </p>
      </div>
    </div>
  );
}
