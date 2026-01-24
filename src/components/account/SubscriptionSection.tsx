import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Calendar, 
  Sparkles, 
  CheckCircle,
  Loader2,
  BarChart3,
  History
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ProfileData } from '@/hooks/useProfile';

interface SubscriptionSectionProps {
  profile: ProfileData;
  planConfig: {
    name: string;
    price: number;
    analysesLimit: number;
    features: string[];
  };
  usage: {
    analysisCount: number;
  } | null;
  usageLoading: boolean;
  subscriptionEnd: string | null;
  subscribed: boolean;
  onManageSubscription: () => void;
  portalLoading: boolean;
}

export function SubscriptionSection({
  profile,
  planConfig,
  usage,
  usageLoading,
  subscriptionEnd,
  subscribed,
  onManageSubscription,
  portalLoading
}: SubscriptionSectionProps) {
  const usagePercentage = usage 
    ? (usage.analysisCount / (planConfig.analysesLimit || 1)) * 100 
    : 0;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Current Plan Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Current Plan
          </CardTitle>
          <CardDescription>Your active subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {planConfig.name}
                </span>
                {subscribed && (
                  <Badge variant="default" className="bg-bullish text-bullish-foreground">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {planConfig.price === 0 
                  ? 'Free forever' 
                  : `$${planConfig.price}/month`}
              </p>
            </div>
          </div>

          {subscriptionEnd && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Renews on {new Date(subscriptionEnd).toLocaleDateString()}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {subscribed ? (
              <Button 
                variant="outline" 
                onClick={onManageSubscription}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Manage Subscription
              </Button>
            ) : (
              <Button asChild>
                <Link to="/pricing">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Monthly Usage
          </CardTitle>
          <CardDescription>Analyses used this month</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {usageLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Analyses</span>
                  <span className="font-medium text-foreground">
                    {usage?.analysisCount || 0} / {planConfig.analysesLimit}
                  </span>
                </div>
                <Progress value={Math.min(usagePercentage, 100)} className="h-2" />
              </div>

              {usagePercentage >= 80 && profile.subscription_plan === 'free' && (
                <div className="bg-caution/10 border border-caution/20 rounded-lg p-3">
                  <p className="text-sm text-caution">
                    You're running low on free analyses. 
                    <Link to="/pricing" className="underline ml-1">
                      Upgrade for more
                    </Link>
                  </p>
                </div>
              )}

              <div className="pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/history">
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Plan Features Card */}
      <Card className="glass-card md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Plan Features
          </CardTitle>
          <CardDescription>What's included in your {planConfig.name} plan</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {planConfig.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-bullish flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          {profile.subscription_plan !== 'trader' && (
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">
                Want more features?
              </p>
              <Button asChild variant="outline">
                <Link to="/pricing">
                  Compare Plans
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
