import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScenarioTable } from '@/components/ScenarioTable';
import { RiskSummary } from '@/components/RiskSummary';
import { AIExplanation } from '@/components/AIExplanation';
import { useTrade } from '@/hooks/useTrade';

const Results = () => {
  const navigate = useNavigate();
  const { analysis, clearAnalysis } = useTrade();

  useEffect(() => {
    if (!analysis) {
      navigate('/');
    }
  }, [analysis, navigate]);

  if (!analysis) {
    return null;
  }

  const { input, results } = analysis;

  const handleNewAnalysis = () => {
    clearAnalysis();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-6 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewAnalysis}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Trade Analysis Results</h1>
            <p className="text-sm text-muted-foreground">Scenario-based evaluation</p>
          </div>
        </div>

        {/* Trade Summary */}
        <div className="glass-card p-4 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Asset:</span>
              <span className="font-mono font-semibold text-foreground">{input.asset}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Direction:</span>
              <span className={`flex items-center gap-1 font-semibold ${
                input.direction === 'long' ? 'text-bullish' : 'text-bearish'
              }`}>
                {input.direction === 'long' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {input.direction.charAt(0).toUpperCase() + input.direction.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Entry:</span>
              <span className="font-mono font-semibold text-foreground">
                ${input.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Horizon:</span>
              <span className="font-semibold text-foreground">{input.timeHorizon}</span>
            </div>
          </div>
        </div>

        {/* Risk Summary */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-lg font-semibold mb-3 text-foreground">Risk Overview</h2>
          <RiskSummary analysis={analysis} />
        </div>

        {/* Scenario Table */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-lg font-semibold mb-3 text-foreground">Scenario Analysis</h2>
          <ScenarioTable results={results} />
        </div>

        {/* AI Explanation */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <AIExplanation analysis={analysis} />
        </div>

        {/* New Analysis Button */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <Button onClick={handleNewAnalysis} className="px-8">
            Analyze Another Trade
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-8 max-w-md mx-auto">
          This analysis uses predefined scenarios for educational purposes only. 
          Markets are unpredictable. This is not financial advice and no outcomes are guaranteed.
        </p>
      </div>
    </div>
  );
};

export default Results;
