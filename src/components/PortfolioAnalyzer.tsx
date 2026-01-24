/**
 * Portfolio Batch Analysis Component
 * Multi-asset analysis with correlation matrix and combined risk metrics
 */

import { useState } from 'react';
import { Plus, Trash2, Loader2, PieChart, TrendingUp, TrendingDown, AlertTriangle, BarChart3, Briefcase } from 'lucide-react';
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
import { Market, TradeDirection, TimeHorizon, MARKETS } from '@/types/trade';
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground font-brand">Portfolio Analysis</h2>
          <p className="text-sm text-muted-foreground">
            Analyze multiple assets with correlation and combined risk metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => applyTemplate('balanced')}>
            Balanced
          </Button>
          <Button variant="outline" size="sm" onClick={() => applyTemplate('aggressive')}>
            Aggressive
          </Button>
          <Button variant="outline" size="sm" onClick={() => applyTemplate('conservative')}>
            Conservative
          </Button>
        </div>
      </div>

      {/* Asset List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Portfolio Assets</CardTitle>
            <Badge variant={isValidPortfolio ? 'default' : 'destructive'}>
              {totalWeight}% allocated
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {assets.map((asset, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Input
                placeholder="Symbol"
                value={asset.symbol}
                onChange={(e) => updateAsset(index, { symbol: e.target.value.toUpperCase() })}
                className="w-24 font-mono"
              />
              <Select 
                value={asset.market} 
                onValueChange={(v) => updateAsset(index, { market: v as Market })}
              >
                <SelectTrigger className="w-20">
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
                  "flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  asset.direction === 'long' 
                    ? "bg-bullish/10 text-bullish" 
                    : "bg-bearish/10 text-bearish"
                )}
              >
                {asset.direction === 'long' ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {asset.direction}
              </button>
              <div className="flex items-center gap-2 flex-1">
                <Slider
                  value={[asset.weight]}
                  onValueChange={(v) => updateAsset(index, { weight: v[0] })}
                  min={0}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="w-12 text-sm font-mono text-right">{asset.weight}%</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeAsset(index)}
                disabled={assets.length <= 2}
                className="flex-shrink-0"
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
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Asset ({assets.length}/10)
          </Button>
        </CardContent>
      </Card>

      {/* Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Time Horizon</Label>
          <Select value={timeHorizon} onValueChange={(v) => setTimeHorizon(v as TimeHorizon)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-3 days">1–3 days</SelectItem>
              <SelectItem value="3-7 days">3–7 days</SelectItem>
              <SelectItem value="7-30 days">7–30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Confidence Level: {confidence}/10</Label>
          <Slider
            value={[confidence]}
            onValueChange={(v) => setConfidence(v[0])}
            min={1}
            max={10}
            step={1}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleAnalyze}
        disabled={!isValidPortfolio || isLoading}
        className="w-full py-6 text-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Analyzing {assets.length} Assets...
          </>
        ) : (
          <>
            <PieChart className="mr-2 h-5 w-5" />
            Analyze Portfolio
          </>
        )}
      </Button>
    </div>
  );
}

// Results display
function PortfolioResults({ result, onReset }: { result: BatchAnalysisResult; onReset: () => void }) {
  const { portfolio, assets } = result;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground font-brand">Portfolio Analysis</h2>
          <p className="text-sm text-muted-foreground">
            {assets.length} assets • {result.simulationPaths.toLocaleString()} simulation paths
          </p>
        </div>
        <Button variant="outline" onClick={onReset}>New Analysis</Button>
      </div>

      {/* Portfolio Summary */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Expected Return</p>
              <p className={cn(
                "text-2xl font-bold font-mono",
                portfolio.weightedReturn >= 0 ? "text-bullish" : "text-bearish"
              )}>
                {portfolio.weightedReturn >= 0 ? '+' : ''}{portfolio.weightedReturn.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Portfolio VaR (95%)</p>
              <p className="text-2xl font-bold font-mono text-bearish">
                -{portfolio.riskMetrics.portfolioVaR95.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Win Probability</p>
              <p className="text-2xl font-bold font-mono text-foreground">
                {(portfolio.riskMetrics.probabilityOfProfit * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Diversification Benefit</p>
              <p className="text-2xl font-bold font-mono text-bullish">
                -{portfolio.riskMetrics.diversificationBenefit.toFixed(1)}% risk
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Contribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Risk Contribution by Asset
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {portfolio.riskMetrics.riskContribution.map((item) => (
            <div key={item.symbol} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono font-medium">{item.symbol}</span>
                <span className="text-muted-foreground">{item.contribution.toFixed(1)}%</span>
              </div>
              <Progress value={item.contribution} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Individual Assets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Individual Asset Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assets.map((asset) => (
              <div 
                key={asset.symbol}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold">{asset.symbol}</span>
                  <Badge variant="outline" className={cn(
                    asset.direction === 'long' ? "text-bullish" : "text-bearish"
                  )}>
                    {asset.direction}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{asset.weight}% weight</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Return: </span>
                    <span className={cn(
                      "font-mono font-medium",
                      asset.simulation.meanReturn >= 0 ? "text-bullish" : "text-bearish"
                    )}>
                      {asset.simulation.meanReturn >= 0 ? '+' : ''}{asset.simulation.meanReturn.toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">VaR: </span>
                    <span className="font-mono font-medium text-bearish">
                      -{asset.riskMetrics.valueAtRisk95.toFixed(2)}%
                    </span>
                  </div>
                  {asset.sentiment && (
                    <Badge variant="outline" className={cn(
                      asset.sentiment.direction === 'bullish' ? "text-bullish" :
                      asset.sentiment.direction === 'bearish' ? "text-bearish" : "text-muted-foreground"
                    )}>
                      {asset.sentiment.direction} ({asset.sentiment.sourceCount} sources)
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Correlation Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Correlation Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr>
                  <th className="p-2 text-left"></th>
                  {portfolio.correlationMatrix.assets.map((a) => (
                    <th key={a} className="p-2 text-center">{a}</th>
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
                          "p-2 text-center",
                          i === j ? "bg-muted" :
                          corr > 0.5 ? "bg-bullish/20" :
                          corr < -0.1 ? "bg-bearish/20" : ""
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
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center">
        Correlations are estimated. For accurate analysis, historical price data is recommended.
        This is educational analysis only—not financial advice.
      </p>
    </div>
  );
}
