import { BarChart3 } from 'lucide-react';
import { TradeInputForm } from '@/components/TradeInputForm';
import { useTrade } from '@/hooks/useTrade';

const Index = () => {
  const { submitTrade } = useTrade();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <BarChart3 className="h-4 w-4" />
            Scenario Analysis Tool
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Scenario Trade Analyzer
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Understand how your trade might perform across different market scenarios. 
            Educational analysis only—not financial advice.
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-6 animate-fade-in">
          <TradeInputForm onSubmit={submitTrade} />
        </div>

        {/* Footer Disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-8 max-w-sm mx-auto">
          This tool uses predefined scenarios for educational purposes. 
          No live market data. No execution. No claims of accuracy.
        </p>
      </div>
    </div>
  );
};

export default Index;
