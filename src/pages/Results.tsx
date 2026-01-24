import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Globe, Activity, Gauge, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuantMetricsCard } from '@/components/QuantMetricsCard';
import { StructuredScenarioDisplay } from '@/components/StructuredScenarioDisplay';
import { RiskSummary } from '@/components/RiskSummary';
import { AIExplanation } from '@/components/AIExplanation';
import { Layout } from '@/components/layout/Layout';
import { useTrade } from '@/hooks/useTrade';
import { MARKETS } from '@/types/trade';

const Results = () => {
  const navigate = useNavigate();
  const { analysis, clearAnalysis } = useTrade();

  useEffect(() => {
    if (!analysis) {
      navigate('/analyze');
    }
  }, [analysis, navigate]);

  if (!analysis) {
    return null;
  }

  const { input, quantMetrics, scenarios, allResults } = analysis;
  const marketInfo = MARKETS[input.market];

  const handleNewAnalysis = () => {
    clearAnalysis();
    navigate('/analyze');
  };

  return (
    <Layout hideFooter>
      <div className="section-container py-6">
        <div className="max-w-5xl mx-auto">
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
              <h1 className="text-2xl font-bold text-foreground font-brand">Trade Analysis Results</h1>
              <p className="text-sm text-muted-foreground">Educational scenario-based evaluation</p>
            </div>
          </div>

          {/* Trade Input Summary */}
          <div className="glass-card p-4 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Market:</span>
                <span className="font-semibold text-foreground">{marketInfo.name}</span>
              </div>
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
                <span className="text-sm text-muted-foreground">Entry:</span>
                <span className="font-mono font-semibold text-foreground">
                  {marketInfo.currencySymbol}{input.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Horizon:</span>
                <span className="font-semibold text-foreground">{input.timeHorizon}</span>
              </div>
            </div>
          </div>

          {/* Step 1: Quantitative Metrics */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">1</div>
              <h2 className="text-lg font-semibold text-foreground font-brand">Quantitative Metrics</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Computed from your trade parameters using historical volatility data.
            </p>
            <QuantMetricsCard metrics={quantMetrics} currencySymbol={marketInfo.currencySymbol} />
          </div>

          {/* Step 2: Risk Overview */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">2</div>
              <h2 className="text-lg font-semibold text-foreground font-brand">Risk Overview</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Best and worst case outcomes based on structured scenario analysis.
            </p>
            <RiskSummary analysis={analysis} />
          </div>

          {/* Step 3: Structured Scenarios */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">3</div>
              <h2 className="text-lg font-semibold text-foreground font-brand">
                Scenario Analysis ({allResults.length} scenarios)
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Scenarios organized by outcome type: base case, upside potential, downside risk, and tail events.
            </p>
            <StructuredScenarioDisplay scenarios={scenarios} currencySymbol={marketInfo.currencySymbol} />
          </div>

          {/* Step 4: AI Explanation */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">4</div>
              <h2 className="text-lg font-semibold text-foreground font-brand">AI Explanation</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Qualitative reasoning based on the quantitative analysis and scenarios above.
            </p>
            <AIExplanation analysis={analysis} />
          </div>

          {/* New Analysis Button */}
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <Button onClick={handleNewAnalysis} className="px-8">
              Analyze Another Trade
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Educational Disclaimer:</strong> This analysis uses predefined scenarios and simplified volatility estimates. 
              It does not use live market data, does not predict actual outcomes, and is not financial advice. 
              Markets are inherently unpredictable. Always consult a qualified financial advisor before trading.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Results;
