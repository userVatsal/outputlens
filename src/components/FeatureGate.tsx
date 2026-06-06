import React from 'react';
import { usePlan } from '@/hooks/usePlan';
import { planHasFeature, PLAN_CONFIG } from '@/lib/stripe';
import { Lock, TrendingUp, TrendingDown, Minus, PieChart, FileDown, Bell, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

type GatableFeature = 'sentiment' | 'portfolio' | 'api' | 'exports' | 'alerts';

interface FeatureGateProps {
  feature: GatableFeature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  showPreview?: boolean;
}

interface UpgradePromptProps {
  feature: GatableFeature;
  showPreview?: boolean;
}

const FEATURE_CONFIG: Record<GatableFeature, { 
  title: string; 
  description: string; 
  minPlan: string;
  price: number;
  icon: React.ElementType;
}> = {
  sentiment: {
    title: 'Neural Database Insights',
    description: 'Full neural database + auto AI explanations. Retrieves historical patterns—never predicts.',
    minPlan: 'Starter',
    price: 19,
    icon: TrendingUp,
  },
  portfolio: {
    title: 'Portfolio Analysis',
    description: 'Analyze correlated assets with stochastic modeling and regime detection.',
    minPlan: 'Pro',
    price: 39,
    icon: PieChart,
  },
  api: {
    title: 'API Access',
    description: 'Integrate OutputLens with your trading systems via REST API.',
    minPlan: 'Trader',
    price: 99,
    icon: Code,
  },
  exports: {
    title: 'Export Reports',
    description: 'Download probabilistic analysis as PDF or CSV for offline review.',
    minPlan: 'Pro',
    price: 39,
    icon: FileDown,
  },
  alerts: {
    title: 'Risk Alerts',
    description: 'Get notified when assets breach VaR thresholds or regime shifts.',
    minPlan: 'Trader',
    price: 99,
    icon: Bell,
  }
};

// Blurred preview components for each feature
function SentimentPreview() {
  return (
    <div className="space-y-3 opacity-60">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Overall Sentiment</span>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-bullish" />
          <span className="font-semibold text-bullish">Bullish +0.42</span>
        </div>
      </div>
      <Progress value={71} className="h-2" />
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="bg-bullish/10 text-bullish p-2 rounded-lg">12 Bullish</div>
        <div className="bg-muted p-2 rounded-lg text-muted-foreground">5 Neutral</div>
        <div className="bg-bearish/10 text-bearish p-2 rounded-lg">3 Bearish</div>
      </div>
      <div className="text-xs text-muted-foreground">
        Top signal: "Strong institutional buying pressure detected..."
      </div>
    </div>
  );
}

function PortfolioPreview() {
  return (
    <div className="space-y-3 opacity-60">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="text-xs text-muted-foreground">Portfolio VaR</div>
          <div className="text-lg font-bold text-bearish">-4.2%</div>
        </div>
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="text-xs text-muted-foreground">Correlation</div>
          <div className="text-lg font-bold">0.67</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-bullish/20 h-3 rounded" style={{ width: '45%' }} />
        <div className="flex-1 bg-caution/20 h-3 rounded" style={{ width: '30%' }} />
        <div className="flex-1 bg-bearish/20 h-3 rounded" style={{ width: '25%' }} />
      </div>
    </div>
  );
}

function AlertsPreview() {
  return (
    <div className="space-y-2 opacity-60">
      <div className="flex items-center gap-2 p-2 bg-caution/10 rounded-lg">
        <Bell className="h-4 w-4 text-caution" />
        <span className="text-sm">AAPL risk score increased to 7.2</span>
      </div>
      <div className="flex items-center gap-2 p-2 bg-bullish/10 rounded-lg">
        <TrendingUp className="h-4 w-4 text-bullish" />
        <span className="text-sm">TSLA target price reached: $250</span>
      </div>
    </div>
  );
}

function DefaultPreview() {
  return (
    <div className="space-y-3 opacity-60">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="h-8 bg-muted rounded w-full" />
    </div>
  );
}

const FEATURE_PREVIEWS: Record<GatableFeature, React.ReactNode> = {
  sentiment: <SentimentPreview />,
  portfolio: <PortfolioPreview />,
  api: <DefaultPreview />,
  exports: <DefaultPreview />,
  alerts: <AlertsPreview />,
};

export function UpgradePrompt({ feature, showPreview = true }: UpgradePromptProps) {
  const navigate = useNavigate();
  const config = FEATURE_CONFIG[feature];
  const Icon = config.icon;
  
  return (
    <Card className="glass-card border-dashed border-primary/30 bg-primary/5 relative overflow-hidden">
      {showPreview && (
        <>
          {/* Blurred preview background */}
          <div className="absolute inset-0 z-0 p-6 blur-[3px] pointer-events-none">
            {FEATURE_PREVIEWS[feature]}
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/70 z-10" />
        </>
      )}
      
      <CardContent className="py-6 relative z-20">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3 rounded-full bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{config.title}</h3>
              <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded font-semibold">
                {config.minPlan.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
          <Button 
            onClick={() => navigate('/pricing')}
            variant="default"
            size="sm"
            className="mt-2"
          >
            <Icon className="h-4 w-4 mr-2" />
            Unlock with {config.minPlan} (${config.price}/mo)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback,
  showUpgradePrompt = true,
  showPreview = true
}: FeatureGateProps) {
  const { plan, isLoading } = usePlan();
  
  // While loading, show nothing or a skeleton
  if (isLoading) {
    return null;
  }
  
  const hasAccess = planHasFeature(plan, feature);
  
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    if (showUpgradePrompt) {
      return <UpgradePrompt feature={feature} showPreview={showPreview} />;
    }
    return null;
  }
  
  return <>{children}</>;
}

// Hook for programmatic feature checking
export function useFeatureAccess(feature: GatableFeature): boolean {
  const { plan, isLoading } = usePlan();
  
  if (isLoading) return false;
  
  return planHasFeature(plan, feature);
}
