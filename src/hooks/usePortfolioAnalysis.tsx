/**
 * Hook for portfolio batch analysis
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  BatchAnalysisInput, 
  BatchAnalysisResult, 
  PortfolioAsset,
  PortfolioRiskMetrics,
  CorrelationMatrix,
  AssetAnalysisResult,
  AdvancedRiskMetrics
} from '@/types/portfolio';
import { useMarketData } from './useMarketData';
import { runScenarioAnalysis, parseHorizonToDays } from '@/lib/scenarioEngine';
import { calculateAdvancedRiskMetrics } from '@/lib/riskMetrics';

interface UsePortfolioReturn {
  result: BatchAnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  analyzePortfolio: (input: BatchAnalysisInput) => Promise<BatchAnalysisResult | null>;
  clearResult: () => void;
}

export function usePortfolioAnalysis(): UsePortfolioReturn {
  const [result, setResult] = useState<BatchAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchMarketData } = useMarketData();

  const analyzePortfolio = useCallback(async (
    input: BatchAnalysisInput
  ): Promise<BatchAnalysisResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { assets, timeHorizon, confidence = 5 } = input;
      const holdingDays = parseHorizonToDays(timeHorizon);
      const dataSources: string[] = [];
      
      // Analyze each asset in parallel
      const assetResults: AssetAnalysisResult[] = await Promise.all(
        assets.map(async (asset) => {
          // Fetch market data
          let marketData = null;
          let volatility = 20; // default
          
          try {
            marketData = await fetchMarketData(asset.symbol, asset.market);
            if (marketData?.volatility) {
              volatility = marketData.volatility;
              if (!dataSources.includes(marketData.source)) {
                dataSources.push(marketData.source);
              }
            }
          } catch (e) {
            console.warn(`Failed to fetch data for ${asset.symbol}:`, e);
          }

          const entryPrice = asset.entryPrice || marketData?.price || 100;

          // Run Monte Carlo simulation
          const { simulation, scenarios } = runScenarioAnalysis({
            entryPrice,
            volatility,
            timeHorizon,
            direction: asset.direction,
            market: asset.market,
            confidence,
            simulations: 5000 // Fewer paths per asset for batch
          });

          // Calculate risk metrics
          const riskMetrics = calculateAdvancedRiskMetrics(
            simulation,
            volatility,
            holdingDays,
            asset.direction,
            !!marketData
          );

          // Check for sentiment data
          let sentiment = null;
          try {
            const { data: sentimentData } = await supabase
              .from('aggregated_insights')
              .select('weighted_sentiment, total_signals')
              .eq('asset', asset.symbol.toUpperCase())
              .gte('expires_at', new Date().toISOString())
              .order('computed_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (sentimentData) {
              const score = sentimentData.weighted_sentiment || 0;
              sentiment = {
                score,
                direction: score > 0.1 ? 'bullish' : score < -0.1 ? 'bearish' : 'neutral' as const,
                sourceCount: sentimentData.total_signals || 0
              };
            }
          } catch {
            // No sentiment data available
          }

          return {
            symbol: asset.symbol.toUpperCase(),
            market: asset.market,
            direction: asset.direction,
            weight: asset.weight,
            currentPrice: marketData?.price || entryPrice,
            entryPrice,
            riskMetrics,
            scenarios,
            simulation: {
              paths: simulation.paths,
              meanReturn: simulation.meanReturn,
              medianReturn: simulation.medianReturn,
              stdDev: simulation.stdDev
            },
            sentiment
          };
        })
      );

      // Calculate portfolio-level metrics
      const portfolioMetrics = calculatePortfolioMetrics(assetResults);
      const correlationMatrix = estimateCorrelationMatrix(assetResults);

      // Find best/worst performers
      const sortedByReturn = [...assetResults].sort(
        (a, b) => b.simulation.meanReturn - a.simulation.meanReturn
      );

      const batchResult: BatchAnalysisResult = {
        assets: assetResults,
        portfolio: {
          totalValue: assetResults.reduce((sum, a) => sum + a.entryPrice * (a.weight / 100), 0),
          weightedReturn: assetResults.reduce(
            (sum, a) => sum + a.simulation.meanReturn * (a.weight / 100), 0
          ),
          riskMetrics: portfolioMetrics,
          correlationMatrix
        },
        bestAsset: {
          symbol: sortedByReturn[0].symbol,
          expectedReturn: sortedByReturn[0].simulation.meanReturn
        },
        worstAsset: {
          symbol: sortedByReturn[sortedByReturn.length - 1].symbol,
          expectedReturn: sortedByReturn[sortedByReturn.length - 1].simulation.meanReturn
        },
        analyzedAt: Date.now(),
        simulationPaths: assetResults.reduce((sum, a) => sum + a.simulation.paths, 0),
        dataSourcesUsed: dataSources
      };

      setResult(batchResult);
      return batchResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Portfolio analysis failed';
      setError(message);
      console.error('Portfolio analysis error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchMarketData]);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    isLoading,
    error,
    analyzePortfolio,
    clearResult
  };
}

/**
 * Calculate portfolio-level risk metrics from individual asset results
 */
function calculatePortfolioMetrics(assets: AssetAnalysisResult[]): PortfolioRiskMetrics {
  const weights = assets.map(a => a.weight / 100);
  const returns = assets.map(a => a.simulation.meanReturn);
  const volatilities = assets.map(a => a.simulation.stdDev);
  const vars95 = assets.map(a => a.riskMetrics.valueAtRisk95);
  const vars99 = assets.map(a => a.riskMetrics.valueAtRisk99);
  const es = assets.map(a => a.riskMetrics.expectedShortfall);

  // Weighted expected return
  const expectedReturn = weights.reduce((sum, w, i) => sum + w * returns[i], 0);

  // Simple portfolio volatility (assuming some correlation)
  // For now, use a simplified approach - would need historical data for accurate correlation
  const avgCorrelation = 0.3; // Assumption
  const weightedVolSquared = weights.reduce((sum, w, i) => sum + (w * volatilities[i]) ** 2, 0);
  const crossTerms = weights.reduce((sum, wi, i) => {
    return sum + weights.reduce((innerSum, wj, j) => {
      if (i !== j) {
        return innerSum + 2 * wi * wj * volatilities[i] * volatilities[j] * avgCorrelation;
      }
      return innerSum;
    }, 0);
  }, 0);
  const portfolioVolatility = Math.sqrt(weightedVolSquared + crossTerms);

  // Diversification benefit
  const undiversifiedVol = weights.reduce((sum, w, i) => sum + w * volatilities[i], 0);
  const diversificationRatio = portfolioVolatility > 0 ? undiversifiedVol / portfolioVolatility : 1;
  const diversificationBenefit = undiversifiedVol > 0 
    ? ((undiversifiedVol - portfolioVolatility) / undiversifiedVol) * 100 
    : 0;

  // Portfolio VaR (simplified - correlated sum)
  const portfolioVaR95 = weights.reduce((sum, w, i) => sum + w * vars95[i], 0) * (1 - diversificationBenefit / 200);
  const portfolioVaR99 = weights.reduce((sum, w, i) => sum + w * vars99[i], 0) * (1 - diversificationBenefit / 200);
  const portfolioExpectedShortfall = weights.reduce((sum, w, i) => sum + w * es[i], 0);

  // Concentration metrics
  const sortedWeights = [...weights].sort((a, b) => b - a);
  const herfindahlIndex = weights.reduce((sum, w) => sum + w ** 2, 0);
  const topConcentration = sortedWeights.slice(0, 3).reduce((sum, w) => sum + w, 0) * 100;

  // Risk contribution
  const riskContribution = assets.map((a, i) => ({
    symbol: a.symbol,
    contribution: (weights[i] * volatilities[i]) / portfolioVolatility * 100 || 0
  })).sort((a, b) => b.contribution - a.contribution);

  // Sharpe ratio
  const riskFreeRate = 4.5; // Approximate current risk-free rate
  const sharpeRatio = portfolioVolatility > 0 
    ? (expectedReturn - riskFreeRate) / portfolioVolatility 
    : 0;

  // Max drawdown estimate (approximation based on volatility and time)
  const maxDrawdownEstimate = portfolioVolatility * 2.5;

  // Probability metrics (weighted average)
  const probabilityOfLoss = weights.reduce((sum, w, i) => 
    sum + w * assets[i].riskMetrics.probabilityOfLoss, 0
  );
  const probabilityOfProfit = 1 - probabilityOfLoss;

  return {
    portfolioVaR95,
    portfolioVaR99,
    portfolioExpectedShortfall,
    diversificationRatio,
    diversificationBenefit,
    herfindahlIndex,
    topConcentration,
    riskContribution,
    expectedReturn,
    portfolioVolatility,
    sharpeRatio,
    maxDrawdownEstimate,
    probabilityOfLoss,
    probabilityOfProfit
  };
}

/**
 * Estimate correlation matrix between assets
 * In production, this would use historical price data
 */
function estimateCorrelationMatrix(assets: AssetAnalysisResult[]): CorrelationMatrix {
  const n = assets.length;
  const symbols = assets.map(a => a.symbol);
  
  // Initialize with identity matrix
  const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
  
  // Simple heuristic correlations based on asset types
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1;
      } else {
        // Estimate correlation based on asset similarity
        matrix[i][j] = estimatePairCorrelation(symbols[i], symbols[j]);
      }
    }
  }

  return { assets: symbols, matrix };
}

function estimatePairCorrelation(a: string, b: string): number {
  // Simple heuristic - in production use historical data
  const cryptos = ['BTC', 'ETH', 'SOL', 'ADA'];
  const techStocks = ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'QQQ', 'ARKK'];
  const bonds = ['TLT', 'BND', 'AGG'];
  const commodities = ['GLD', 'SLV', 'USO'];
  const indices = ['SPY', 'IWM', 'DIA', 'FTSE', 'DAX'];

  const isSameClass = (asset: string, cls: string[]) => cls.includes(asset.toUpperCase());

  // Same class = high correlation
  if (
    (isSameClass(a, cryptos) && isSameClass(b, cryptos)) ||
    (isSameClass(a, techStocks) && isSameClass(b, techStocks)) ||
    (isSameClass(a, bonds) && isSameClass(b, bonds)) ||
    (isSameClass(a, commodities) && isSameClass(b, commodities)) ||
    (isSameClass(a, indices) && isSameClass(b, indices))
  ) {
    return 0.7 + Math.random() * 0.2;
  }

  // Stocks vs bonds = negative correlation
  if (
    (isSameClass(a, techStocks) || isSameClass(a, indices)) && isSameClass(b, bonds) ||
    (isSameClass(b, techStocks) || isSameClass(b, indices)) && isSameClass(a, bonds)
  ) {
    return -0.2 + Math.random() * 0.2;
  }

  // Crypto vs stocks = moderate correlation
  if (
    isSameClass(a, cryptos) && (isSameClass(b, techStocks) || isSameClass(b, indices)) ||
    isSameClass(b, cryptos) && (isSameClass(a, techStocks) || isSameClass(a, indices))
  ) {
    return 0.4 + Math.random() * 0.2;
  }

  // Default: low correlation
  return 0.1 + Math.random() * 0.2;
}
