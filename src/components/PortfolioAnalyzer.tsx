/**
 * Portfolio Batch Analysis Component
 * Multi-asset analysis with correlation matrix and combined risk metrics
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Loader2, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  BarChart3, 
  Briefcase,
  Sparkles,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Zap,
  Target,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePortfolioAnalysis } from '@/hooks/usePortfolioAnalysis';
import { PortfolioAsset, PORTFOLIO_TEMPLATES, BatchAnalysisResult } from '@/types/portfolio';
import { Market, TradeDirection, TimeHorizon } from '@/types/trade';
import { cn } from '@/lib/utils';

export function PortfolioAnalyzer() {
  const { result, isLoading, error, analyzePortfolio, clearResult } = usePortfolioAnalysis();
  const [assets, setAssets] = useState<PortfolioAsset[]>([
    { symbol: 'SPY', market: 'US', direction: 'long', weight: 50 },
    { symbol: 'BTC', market: 'US', direction: 'long', weight: 30 },
    { symbol: 'GLD', market: 'US', direction: 'long', weight: 20 },
  ]);
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('3-7 days');
  const [confidence, setConfidence] = useState(5);

  const totalWeight = assets.reduce((sum, a) => sum + a.weight, 0);
  const isValidPortfolio = assets.length >= 2 && Math.abs(totalWeight - 100) <= 1;

  const addAsset = () => {
    if (assets.length >= 10) return;
    setAssets([...assets, { symbol: '', market: 'US', direction: 'long', weight: 0 }]);
  };

  const removeAsset = (index: number) => {
    if (assets.length <= 2) return;
    setAssets(assets.filter((_, i) => i !== index));
  };

  const updateAsset = (index: number, updates: Partial<PortfolioAsset>) => {
    setAssets(assets.map((a, i) => i === index ? { ...a, ...updates } : a));
  };

  const applyTemplate = (template: keyof typeof PORTFOLIO_TEMPLATES) => {
    setAssets([...PORTFOLIO_TEMPLATES[template]]);
  };

  const handleAnalyze = async () => {
    if (!isValidPortfolio) return;
    await analyzePortfolio({ assets, timeHorizon, confidence });
  };

  if (result) {
    return <PortfolioResults result={result} onReset={clearResult} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground font-brand flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Build Your Portfolio
          </h2>
          <p className="text-sm text-muted-foreground">
            Add assets, set weights, and run combined analysis
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => applyTemplate('balanced')}
            className="text-xs"
          >
            <Target className="h-3 w-3 mr-1" />
            Balanced
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => applyTemplate('aggressive')}
            className="text-xs"
          >
            <Zap className="h-3 w-3 mr-1" />
            Aggressive
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => applyTemplate('conservative')}
            className="text-xs"
          >
            <Shield className="h-3 w-3 mr-1" />
            Conservative
          </Button>
        </div>
      </div>

      {/* Allocation Status */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Portfolio Allocation</span>
          <Badge variant={isValidPortfolio ? 'default' : 'destructive'} className="font-mono">
            {totalWeight}% / 100%
          </Badge>
        </div>
        <Progress 
          value={Math.min(totalWeight, 100)} 
          className={cn(
            "h-2",
            totalWeight > 100 && "[&>div]:bg-destructive"
          )} 
        />
        {!isValidPortfolio && (
          <p className="text-xs text-muted-foreground mt-2">
            {totalWeight < 100 
              ? `Add ${100 - totalWeight}% more to reach 100% allocation` 
              : `Remove ${totalWeight - 100}% to reach 100% allocation`}
          </p>
        )}
      </div>

      {/* Asset List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Assets ({assets.length}/10)</Label>
        </div>
        
        {assets.map((asset, index) => (
          <div 
            key={index} 
            className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-5">{index + 1}.</span>
              <Input
                placeholder="Symbol"
                value={asset.symbol}
                onChange={(e) => updateAsset(index, { symbol: e.target.value.toUpperCase() })}
                className="w-20 font-mono text-sm h-9"
              />
            </div>
            
            <Select 
              value={asset.market} 
              onValueChange={(v) => updateAsset(index, { market: v as Market })}
            >
              <SelectTrigger className="w-24 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">🇺🇸 US</SelectItem>
                <SelectItem value="UK">🇬🇧 UK</SelectItem>
                <SelectItem value="EU">🇪🇺 EU</SelectItem>
              </SelectContent>
            </Select>
            
            <button
              type="button"
              onClick={() => updateAsset(index, { 
                direction: asset.direction === 'long' ? 'short' : 'long' 
              })}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                asset.direction === 'long' 
                  ? "bg-bullish/10 text-bullish hover:bg-bullish/20" 
                  : "bg-bearish/10 text-bearish hover:bg-bearish/20"
              )}
            >
              {asset.direction === 'long' ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {asset.direction === 'long' ? 'Long' : 'Short'}
            </button>
            
            <div className="flex items-center gap-3 flex-1 min-w-[140px]">
              <Slider
                value={[asset.weight]}
                onValueChange={(v) => updateAsset(index, { weight: v[0] })}
                min={0}
                max={100}
                step={5}
                className="flex-1"
              />
              <span className="w-12 text-sm font-mono text-right font-medium">
                {asset.weight}%
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeAsset(index)}
              disabled={assets.length <= 2}
              className="h-9 w-9 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={addAsset}
          disabled={assets.length >= 10}
          className="w-full border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      </div>

      {/* Settings */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm">Time Horizon</Label>
          <Select value={timeHorizon} onValueChange={(v) => setTimeHorizon(v as TimeHorizon)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-3 days">1–3 days (Short-term)</SelectItem>
              <SelectItem value="3-7 days">3–7 days (Swing)</SelectItem>
              <SelectItem value="7-30 days">7–30 days (Position)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">
            Confidence: <span className="font-mono text-primary">{confidence}/10</span>
          </Label>
          <Slider
            value={[confidence]}
            onValueChange={(v) => setConfidence(v[0])}
            min={1}
            max={10}
            step={1}
          />
          <p className="text-xs text-muted-foreground">
            {confidence <= 3 ? 'Low conviction' : confidence <= 6 ? 'Moderate conviction' : 'High conviction'}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleAnalyze}
        disabled={!isValidPortfolio || isLoading}
        className="w-full py-6 text-lg shadow-lg hover:shadow-xl transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Analyzing {assets.length} Assets...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Analyze Portfolio
          </>
        )}
      </Button>
      
      {isValidPortfolio && !isLoading && (
        <p className="text-xs text-center text-muted-foreground">
          {assets.length} assets × 10,000 simulations = {(assets.length * 10000).toLocaleString()} total paths
        </p>
      )}
    </div>
  );
}

// Results display
function PortfolioResults({ result, onReset }: { result: BatchAnalysisResult; onReset: () => void }) {
  const { portfolio, assets } = result;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Analysis Complete
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-foreground font-brand">Portfolio Results</h2>
          <p className="text-sm text-muted-foreground">
            {assets.length} assets • {result.simulationPaths.toLocaleString()} total simulation paths
          </p>
        </div>
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          New Analysis
        </Button>
      </div>

      {/* Portfolio Summary */}
      <div className="glass-card p-6 bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
          <PieChart className="h-4 w-4" />
          Portfolio Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Expected Return</p>
            <p className={cn(
              "text-2xl font-bold font-mono",
              portfolio.weightedReturn >= 0 ? "text-bullish" : "text-bearish"
            )}>
              {portfolio.weightedReturn >= 0 ? '+' : ''}{portfolio.weightedReturn.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Portfolio VaR (95%)</p>
            <p className="text-2xl font-bold font-mono text-bearish">
              -{portfolio.riskMetrics.portfolioVaR95.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Win Probability</p>
            <p className="text-2xl font-bold font-mono text-foreground">
              {(portfolio.riskMetrics.probabilityOfProfit * 100).toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Diversification Benefit</p>
            <p className="text-2xl font-bold font-mono text-bullish">
              -{portfolio.riskMetrics.diversificationBenefit.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">risk reduction</p>
          </div>
        </div>
      </div>

      {/* Risk Contribution */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Risk Contribution by Asset
        </h3>
        <div className="space-y-4">
          {portfolio.riskMetrics.riskContribution.map((item, index) => (
            <div key={item.symbol} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-foreground">{item.symbol}</span>
                  <span className="text-xs text-muted-foreground">
                    {assets[index]?.weight || 0}% weight
                  </span>
                </div>
                <span className={cn(
                  "font-mono text-sm font-medium",
                  item.contribution > 40 ? "text-bearish" : 
                  item.contribution > 25 ? "text-caution" : "text-muted-foreground"
                )}>
                  {item.contribution.toFixed(1)}% of risk
                </span>
              </div>
              <Progress 
                value={item.contribution} 
                className={cn(
                  "h-2",
                  item.contribution > 40 && "[&>div]:bg-bearish",
                  item.contribution > 25 && item.contribution <= 40 && "[&>div]:bg-caution"
                )}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Individual Assets */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          Individual Asset Analysis
        </h3>
        <div className="space-y-3">
          {assets.map((asset) => (
            <div 
              key={asset.symbol}
              className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-foreground">{asset.symbol}</span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    asset.direction === 'long' ? "text-bullish border-bullish/30" : "text-bearish border-bearish/30"
                  )}
                >
                  {asset.direction === 'long' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {asset.direction}
                </Badge>
                <span className="text-xs text-muted-foreground">{asset.weight}%</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">Return</span>
                  <span className={cn(
                    "font-mono font-medium",
                    asset.simulation.meanReturn >= 0 ? "text-bullish" : "text-bearish"
                  )}>
                    {asset.simulation.meanReturn >= 0 ? '+' : ''}{asset.simulation.meanReturn.toFixed(2)}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">VaR 95%</span>
                  <span className="font-mono font-medium text-bearish">
                    -{asset.riskMetrics.valueAtRisk95.toFixed(2)}%
                  </span>
                </div>
                {asset.sentiment && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      asset.sentiment.direction === 'bullish' ? "text-bullish" :
                      asset.sentiment.direction === 'bearish' ? "text-bearish" : ""
                    )}
                  >
                    {asset.sentiment.direction}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Correlation Matrix */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-foreground mb-4">
          Correlation Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr>
                <th className="p-2 text-left text-muted-foreground"></th>
                {portfolio.correlationMatrix.assets.map((a) => (
                  <th key={a} className="p-2 text-center font-semibold">{a}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {portfolio.correlationMatrix.matrix.map((row, i) => (
                <tr key={i}>
                  <td className="p-2 font-semibold">
                    {portfolio.correlationMatrix.assets[i]}
                  </td>
                  {row.map((corr, j) => (
                    <td 
                      key={j} 
                      className={cn(
                        "p-2 text-center rounded",
                        i === j ? "bg-muted font-bold" :
                        corr > 0.7 ? "bg-bullish/20 text-bullish" :
                        corr > 0.3 ? "bg-bullish/10" :
                        corr < -0.1 ? "bg-bearish/20 text-bearish" : ""
                      )}
                    >
                      {corr.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Lower correlation = better diversification. Negative correlation provides strongest risk reduction.
        </p>
      </div>

      {/* CTA to Single Asset */}
      <div className="glass-card p-6 border-dashed bg-muted/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Want deeper analysis on one asset?
              </h3>
              <p className="text-sm text-muted-foreground">
                Get AI explanations, detailed scenarios, and return distribution charts.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link to="/analyze">
              Single Asset Analysis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center">
        Correlations are estimated from asset class relationships. 
        This is educational analysis only—not financial advice.
      </p>
    </div>
  );
}
