import { useState, createContext, useContext, ReactNode } from 'react';
import { TradeInput, TradeAnalysis, LiveMarketData } from '@/types/trade';
import { createTradeAnalysis } from '@/lib/scenarios';
import { supabase } from '@/integrations/supabase/client';
import { useMarketData } from './useMarketData';

interface TradeContextType {
  analysis: TradeAnalysis | null;
  liveData: LiveMarketData | null;
  submitTrade: (input: TradeInput) => void;
  clearAnalysis: () => void;
  isLoading: boolean;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export function TradeProvider({ children }: { children: ReactNode }) {
  const [analysis, setAnalysis] = useState<TradeAnalysis | null>(null);
  const [liveData, setLiveData] = useState<LiveMarketData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { fetchMarketData } = useMarketData();

  const submitTrade = async (input: TradeInput) => {
    setIsLoading(true);
    setLiveData(null);
    
    try {
      // First, try to fetch live market data for volatility
      let liveVolatility: number | undefined;
      
      try {
        const marketData = await fetchMarketData(input.asset, input.market);
        if (marketData?.volatility) {
          liveVolatility = marketData.volatility;
          setLiveData(marketData);
          console.log(`Using live volatility: ${liveVolatility.toFixed(2)}%`);
        }
      } catch (marketError) {
        console.warn('Could not fetch live market data, using defaults:', marketError);
      }
      
      // Create analysis with live volatility if available
      const result = createTradeAnalysis(input, liveVolatility);
      setAnalysis(result);

      // Save to analysis history
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('analysis_history' as never)
          .insert({
            user_id: session.user.id,
            asset: input.asset,
            market: input.market,
            direction: input.direction,
            entry_price: input.entryPrice,
            time_horizon: input.timeHorizon,
            results: result,
            live_volatility: liveVolatility,
          } as never);
      }
    } catch (error) {
      console.error('Error saving analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysis(null);
    setLiveData(null);
  };

  return (
    <TradeContext.Provider value={{ analysis, liveData, submitTrade, clearAnalysis, isLoading }}>
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
