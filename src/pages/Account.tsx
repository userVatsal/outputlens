import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/BrandLogo';
import { PaywallModal } from '@/components/PaywallModal';
import { useProfile } from '@/hooks/useProfile';
import { usePlan } from '@/hooks/usePlan';
import { useUsage } from '@/hooks/useUsage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Account() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const { profile, loading: profileLoading } = useProfile();
  const { subscribed, planConfig, openCustomerPortal, isLoading: planLoading } = usePlan();
  const { usage, loading: usageLoading } = useUsage();

  useEffect(() => {
    document.title = 'Account | OutputLens';
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      }
      setLoading(false);
    });
  }, [navigate]);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      await openCustomerPortal();
    } catch {
      toast.error('Unable to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm('Are you sure you want to delete your account? This cannot be undone.');
    if (!confirmed) return;

    setDeleting(true);
    try {
      // Delete profile (cascade will handle related data)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('profiles').delete().eq('user_id', session.user.id);
      }
      await supabase.auth.signOut();
      toast.success('Account deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  if (loading || planLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const email = profile?.user_id ? '(loading...)' : 'Unknown';
  const usageCount = usage?.analysisCount || 0;
  const usageLimit = planConfig?.analysesLimit || 5;

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
      <header className="border-b border-border">
        <div className="section-container py-4 flex items-center justify-between">
          <Link to="/">
            <BrandLogo size="md" />
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="section-container py-8">
        <h1 className="text-2xl font-semibold text-foreground mb-8">Account</h1>

        <div className="space-y-6">
          {/* Email */}
          <div className="glass-card p-5">
            <p className="text-sm text-muted-foreground mb-1">Email</p>
            <p className="text-foreground font-medium">
              {profile?.user_id || 'Not available'}
            </p>
          </div>

          {/* Usage */}
          <div className="glass-card p-5">
            <p className="text-sm text-muted-foreground mb-2">Usage this month</p>
            <div className="flex items-center justify-between">
              <p className="text-foreground font-medium">
                {usageLoading ? '...' : `${usageCount} / ${usageLimit === Infinity ? '∞' : usageLimit}`} analyses
              </p>
              <p className="text-xs text-muted-foreground">
                {planConfig?.name || 'Free'} plan
              </p>
            </div>
            {/* Simple progress bar */}
            {usageLimit !== Infinity && (
              <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-foreground rounded-full transition-all"
                  style={{ width: `${Math.min((usageCount / usageLimit) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Subscription */}
          <div className="glass-card p-5">
            <p className="text-sm text-muted-foreground mb-3">Subscription</p>
            {subscribed ? (
              <div className="space-y-3">
                <p className="text-foreground font-medium">{planConfig?.name} Plan</p>
                <Button 
                  variant="outline" 
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                >
                  {portalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Manage subscription
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-foreground">Free plan - 5 analyses per month</p>
                <Button onClick={() => navigate('/account?upgrade=true')}>
                  Upgrade
                </Button>
              </div>
            )}
          </div>

          {/* Delete account */}
          <div className="glass-card p-5">
            <p className="text-sm text-muted-foreground mb-3">Danger zone</p>
            <Button 
              variant="outline" 
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete account
            </Button>
          </div>
        </div>

        {/* Legal link */}
        <p className="text-xs text-muted-foreground mt-8">
          <Link to="/legal" className="hover:text-foreground">Privacy & Terms</Link>
        </p>
      </main>
    </div>
  );
}
