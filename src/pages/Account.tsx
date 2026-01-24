import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  CheckCircle,
  Loader2,
  ExternalLink,
  BarChart3,
  History
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { usePlan } from '@/hooks/usePlan';
import { useUsage } from '@/hooks/useUsage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PLAN_CONFIG, SubscriptionPlan } from '@/lib/stripe';

export default function Account() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  
  const { 
    plan, 
    subscribed, 
    subscriptionEnd, 
    isLoading: planLoading,
    planConfig,
    openCustomerPortal,
    checkSubscription
  } = usePlan();
  
  const { usage, loading: usageLoading } = useUsage();

  useEffect(() => {
    // Check auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      }
      setLoading(false);
    });

    // Handle success redirect
    if (searchParams.get('success') === 'true') {
      toast.success('Subscription activated! Welcome to your new plan.');
      // Refresh subscription status
      checkSubscription();
    }
  }, [navigate, searchParams, checkSubscription]);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      await openCustomerPortal();
    } catch (err) {
      toast.error('Unable to open billing portal. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading || planLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const usagePercentage = usage 
    ? (usage.analysisCount / (planConfig.analysesLimit || 1)) * 100 
    : 0;

  return (
    <Layout>
      <div className="section-container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Account</h1>
            <p className="text-muted-foreground">
              Manage your subscription and view usage statistics
            </p>
          </div>

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
                      onClick={handleManageSubscription}
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

                    {usagePercentage >= 80 && plan === 'free' && (
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
                  <TrendingUp className="h-5 w-5 text-primary" />
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

                {plan !== 'trader' && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-3">
                      Want more features?
                    </p>
                    <Button asChild variant="outline">
                      <Link to="/pricing">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Compare Plans
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
