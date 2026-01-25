import { useState, createContext, useContext, ReactNode } from 'react';
import { TradeInput, MARKETS } from '@/types/trade';
import { EnhancedTradeAnalysis, EnhancedMarketData, EnhancedTradeInput } from '@/types/analysis';
import { runScenarioAnalysis, DynamicScenario } from '@/lib/scenarioEngine';
import { calculateAdvancedRiskMetrics } from '@/lib/riskMetrics';
import { supabase } from '@/integrations/supabase/client';
import { useMarketData } from './useMarketData';

interface TradeContextType {
  analysis: EnhancedTradeAnalysis | null;
  submitTrade: (input: EnhancedTradeInput) => void;
  clearAnalysis: () => void;
  isLoading: boolean;
  isHistorical: boolean;
  loadHistoricalAnalysis: (historyId: string) => Promise<boolean>;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

/**
 * Parse time horizon string to number of days
 */
function parseHorizonToDays(horizon: string): number {
  switch (horizon) {
    case '1-3 days': return 2;
    case '3-7 days': return 5;
    case '7-30 days': return 15;
    default: return 7;
  }
}

/**
 * Flatten all scenarios into a single array for legacy compatibility
 */
function flattenScenarios(scenarios: EnhancedTradeAnalysis['scenarios']): DynamicScenario[] {
  return [
    ...scenarios.base,
    ...scenarios.upside,
    ...scenarios.downside,
    ...scenarios.tail
  ];
}

export function TradeProvider({ children }: { children: ReactNode }) {
  const [analysis, setAnalysis] = useState<EnhancedTradeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistorical, setIsHistorical] = useState(false);
  const { fetchMarketData } = useMarketData();

  /**
   * Load a historical analysis from the database by ID
   */
  const loadHistoricalAnalysis = async (historyId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('analysis_history')
        .select('results')
        .eq('id', historyId)
        .maybeSingle();
      
      if (error || !data?.results) {
        console.error('Failed to load historical analysis:', error);
        return false;
      }
      
      setAnalysis(data.results as unknown as EnhancedTradeAnalysis);
      setIsHistorical(true);
      return true;
    } catch (err) {
      console.error('Error loading historical analysis:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const submitTrade = async (input: EnhancedTradeInput) => {
    setIsLoading(true);
    
    try {
      const marketInfo = MARKETS[input.market];
      let liveVolatility: number | undefined;
      let marketData: EnhancedMarketData | null = null;
      const dataSources: string[] = [];
      
      // Fetch live market data
      try {
        const liveData = await fetchMarketData(input.asset, input.market);
        if (liveData?.volatility) {
          liveVolatility = liveData.volatility;
          marketData = {
            price: liveData.price,
            change: liveData.change,
            changePercent: liveData.changePercent,
            high: liveData.high,
            low: liveData.low,
            open: liveData.open,
            previousClose: liveData.previousClose,
            volume: liveData.volume,
            volatility: liveData.volatility,
            source: liveData.source,
            timestamp: liveData.timestamp,
            dataQuality: 'live'
          };
          dataSources.push(liveData.source);
          console.log(`Using live volatility: ${liveVolatility.toFixed(2)}%`);
        }
      } catch (marketError) {
        console.warn('Could not fetch live market data, using defaults:', marketError);
      }
      
      // Use default volatility if live data unavailable
      const volatility = liveVolatility || marketInfo.baseVolatility;
      const usedLiveData = !!liveVolatility;
      
      if (!marketData) {
        marketData = {
          price: input.entryPrice,
          volatility: volatility,
          source: 'default',
          timestamp: Date.now(),
          dataQuality: 'fallback'
        };
        dataSources.push('market_defaults');
      }
      
      // Run Monte Carlo simulation
      console.log(`Running Monte Carlo simulation with ${volatility.toFixed(2)}% volatility`);
      const { simulation, scenarios } = runScenarioAnalysis({
        entryPrice: input.entryPrice,
        volatility,
        timeHorizon: input.timeHorizon,
        direction: input.direction,
        market: input.market,
        confidence: input.confidence || 5,
        simulations: 10000
      });
      
      // Calculate advanced risk metrics
      const holdingDays = parseHorizonToDays(input.timeHorizon);
      const riskMetrics = calculateAdvancedRiskMetrics(
        simulation,
        volatility,
        holdingDays,
        input.direction,
        usedLiveData
      );
      
      // Find best and worst cases
      const allScenarios = flattenScenarios(scenarios);
      const bestCase = allScenarios.reduce((best, s) => 
        s.returnRangeMax > best.returnMax ? { scenario: s, returnMax: s.returnRangeMax } : best,
        { scenario: allScenarios[0], returnMax: allScenarios[0].returnRangeMax }
      );
      const worstCase = allScenarios.reduce((worst, s) => 
        s.returnRangeMin < worst.returnMin ? { scenario: s, returnMin: s.returnRangeMin } : worst,
        { scenario: allScenarios[0], returnMin: allScenarios[0].returnRangeMin }
      );
      
      // Build enhanced analysis result
      const result: EnhancedTradeAnalysis = {
        input,
        marketData,
        riskMetrics,
        scenarios,
        simulation: {
          paths: simulation.paths,
          meanReturn: simulation.meanReturn,
          medianReturn: simulation.medianReturn,
          stdDev: simulation.stdDev,
          skewness: simulation.skewness,
          kurtosis: simulation.kurtosis
        },
        bestCase,
        worstCase,
        overallRisk: riskMetrics.riskLabel,
        analyzedAt: Date.now(),
        dataSourcesUsed: dataSources
      };
      
      setAnalysis(result);
      console.log(`Analysis complete: ${simulation.paths} paths, ${riskMetrics.probabilityOfProfit.toFixed(1)}% win rate`);

      // Save to analysis history
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          const insertData = {
            user_id: session.user.id,
            asset: input.asset,
            market: input.market,
            direction: input.direction,
            entry_price: input.entryPrice,
            time_horizon: input.timeHorizon,
            user_confidence: input.confidence || 5,
            user_assumptions: input.assumptions || null,
            results: JSON.parse(JSON.stringify(result)),
            live_volatility: liveVolatility || null,
            data_sources: dataSources,
            simulation_stats: {
              paths: simulation.paths,
              meanReturn: simulation.meanReturn,
              kurtosis: simulation.kurtosis
            }
          };
          await supabase.from('analysis_history').insert([insertData]);
        } catch (dbError) {
          console.warn('Could not save analysis history:', dbError);
        }
      }
    } catch (error) {
      console.error('Error in trade analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysis(null);
    setIsHistorical(false);
  };

  return (
    <TradeContext.Provider value={{ 
      analysis, 
      submitTrade, 
      clearAnalysis, 
      isLoading, 
      isHistorical, 
      loadHistoricalAnalysis 
    }}>
      {children}
    </TradeContext.Provider>
  );
}

export function useTrade() {
  const context = useContext(TradeContext);
  if (context === undefined) {
    throw new Error('useTrade must be used within a TradeProvider');
  }
  return context;
}
