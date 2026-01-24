import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, User, CreditCard, Shield } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSection } from '@/components/account/ProfileSection';
import { SubscriptionSection } from '@/components/account/SubscriptionSection';
import { LegalSection } from '@/components/account/LegalSection';
import { useProfile } from '@/hooks/useProfile';
import { usePlan } from '@/hooks/usePlan';
import { useUsage } from '@/hooks/useUsage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Account() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  
  const { 
    profile, 
    loading: profileLoading, 
    updateProfile, 
    checkUsernameAvailable,
    acceptConsent 
  } = useProfile();
  
  const { 
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

  if (loading || planLoading || profileLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Unable to load profile. Please try again.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="section-container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Account</h1>
            <p className="text-muted-foreground">
              Manage your profile, subscription, and privacy settings
            </p>
          </div>

          {/* Tabbed Content */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Subscription</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileSection
                profile={profile}
                onUpdate={updateProfile}
                checkUsernameAvailable={checkUsernameAvailable}
              />
            </TabsContent>

            <TabsContent value="subscription">
              <SubscriptionSection
                profile={profile}
                planConfig={planConfig}
                usage={usage}
                usageLoading={usageLoading}
                subscriptionEnd={subscriptionEnd}
                subscribed={subscribed}
                onManageSubscription={handleManageSubscription}
                portalLoading={portalLoading}
              />
            </TabsContent>

            <TabsContent value="privacy">
              <LegalSection
                profile={profile}
                onAcceptConsent={acceptConsent}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
