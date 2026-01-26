import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { OnboardingWizard, OnboardingStep } from '@/components/onboarding/OnboardingWizard';
import logo from '@/assets/logo.png';

export default function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [initialStep, setInitialStep] = useState<OnboardingStep>('credentials');

  useEffect(() => {
    document.title = 'Complete Your Profile | OutputLens';
    
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Not logged in, start from credentials
        setInitialStep('credentials');
        setLoading(false);
        return;
      }

      // Check if onboarding already completed
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, full_name, username, consent_gdpr')
        .eq('user_id', session.user.id)
        .single();

      if (profile?.onboarding_completed) {
        // Already completed, redirect to dashboard
        navigate('/dashboard');
        return;
      }

      // Determine which step to start from based on profile completion
      if (!profile?.full_name || !profile?.username) {
        setInitialStep('profile');
      } else if (!profile?.consent_gdpr) {
        setInitialStep('legal');
      } else {
        setInitialStep('complete');
      }

      setLoading(false);
    };

    checkSession();

    // Listen for auth changes (e.g., after OAuth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Check profile status after sign in
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed, full_name, username, consent_gdpr')
            .eq('user_id', session.user.id)
            .single();

          if (profile?.onboarding_completed) {
            navigate('/dashboard');
            return;
          }

          if (!profile?.full_name || !profile?.username) {
            setInitialStep('profile');
          } else if (!profile?.consent_gdpr) {
            setInitialStep('legal');
          } else {
            setInitialStep('complete');
          }
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="section-container py-4">
          <Link to="/" className="flex items-center w-fit">
            <img src={logo} alt="OutputLens" className="h-8" />
          </Link>
        </div>
      </header>

      {/* Onboarding content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <OnboardingWizard initialStep={initialStep} />
      </div>
    </div>
  );
}
