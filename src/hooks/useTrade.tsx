import { useState, createContext, useContext, ReactNode } from 'react';
import { TradeInput, TradeAnalysis } from '@/types/trade';
import { createTradeAnalysis } from '@/lib/scenarios';

interface TradeContextType {
  analysis: TradeAnalysis | null;
  submitTrade: (input: TradeInput) => void;
  clearAnalysis: () => void;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export function TradeProvider({ children }: { children: ReactNode }) {
  const [analysis, setAnalysis] = useState<TradeAnalysis | null>(null);

  const submitTrade = (input: TradeInput) => {
    const result = createTradeAnalysis(input);
    setAnalysis(result);
  };

  const clearAnalysis = () => {
    setAnalysis(null);
  };

  return (
    <TradeContext.Provider value={{ analysis, submitTrade, clearAnalysis }}>
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
