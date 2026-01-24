import React from 'react';
import { usePlan } from '@/hooks/usePlan';
import { planHasFeature } from '@/lib/stripe';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

type GatableFeature = 'sentiment' | 'portfolio' | 'api' | 'exports' | 'alerts';

interface FeatureGateProps {
  feature: GatableFeature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

interface UpgradePromptProps {
  feature: GatableFeature;
}

const FEATURE_LABELS: Record<GatableFeature, { title: string; description: string }> = {
  sentiment: {
    title: 'Market Sentiment Analysis',
    description: 'Unlock AI-powered sentiment analysis from news and social media sources.'
  },
  portfolio: {
    title: 'Portfolio Analysis',
    description: 'Analyze your entire portfolio with advanced risk metrics and correlations.'
  },
  api: {
    title: 'API Access',
    description: 'Integrate OutputLens with your trading tools via our REST API.'
  },
  exports: {
    title: 'Export Reports',
    description: 'Download your analysis as PDF or CSV for offline review.'
  },
  alerts: {
    title: 'Price Alerts',
    description: 'Get notified when your assets hit target prices or risk thresholds.'
  }
};

export function UpgradePrompt({ feature }: UpgradePromptProps) {
  const navigate = useNavigate();
  const { title, description } = FEATURE_LABELS[feature];
  
  return (
    <Card className="glass-card border-dashed border-primary/30 bg-primary/5">
      <CardContent className="py-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3 rounded-full bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <Button 
            onClick={() => navigate('/pricing')}
            variant="default"
            size="sm"
            className="mt-2"
          >
            Upgrade to Unlock
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
  showUpgradePrompt = true
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
      return <UpgradePrompt feature={feature} />;
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
