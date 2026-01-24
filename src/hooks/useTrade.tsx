import { useState, createContext, useContext, ReactNode } from 'react';
import { TradeInput, TradeAnalysis } from '@/types/trade';
import { createTradeAnalysis } from '@/lib/scenarios';
import { supabase } from '@/integrations/supabase/client';

interface TradeContextType {
  analysis: TradeAnalysis | null;
  submitTrade: (input: TradeInput) => void;
  clearAnalysis: () => void;
  isLoading: boolean;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export function TradeProvider({ children }: { children: ReactNode }) {
  const [analysis, setAnalysis] = useState<TradeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const submitTrade = async (input: TradeInput) => {
    setIsLoading(true);
    try {
      const result = createTradeAnalysis(input);
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
  };

  return (
    <TradeContext.Provider value={{ analysis, submitTrade, clearAnalysis, isLoading }}>
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
