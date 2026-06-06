import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { StepCredentials } from './StepCredentials';
import { StepLegal } from './StepLegal';

// Simplified 3-step onboarding: Credentials → Legal → Dashboard
export type OnboardingStep = 'credentials' | 'legal' | 'complete';

interface OnboardingWizardProps {
  initialStep?: OnboardingStep;
}

const STEPS: OnboardingStep[] = ['credentials', 'legal', 'complete'];

export function OnboardingWizard({ initialStep = 'credentials' }: OnboardingWizardProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(initialStep);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const currentStepIndex = STEPS.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || null);
        // If already logged in, skip credentials step
        if (currentStep === 'credentials') {
          setCurrentStep('legal');
        }
      }
    });
  }, [currentStep]);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0 && STEPS[prevIndex] !== 'credentials') {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

  const handleCredentialsComplete = (id: string, email: string) => {
    setUserId(id);
    setUserEmail(email);
    handleNext();
  };

  const handleLegalComplete = async () => {
    if (!userId) return;
    
    // Mark onboarding as completed and redirect to dashboard
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('user_id', userId);
    
    navigate('/dashboard');
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'credentials':
        return 'Create Your Account';
      case 'legal':
        return 'Almost There!';
      case 'complete':
        return '';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'credentials':
        return '3 free analyses/month • No credit card • Start in 30 seconds';
      case 'legal':
        return 'Quick legal agreements, then you\'re ready to analyze';
      case 'complete':
        return '';
      default:
        return '';
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      {/* Top progress bar */}
      {currentStep !== 'complete' && (
        <div className="fixed top-0 inset-x-0 h-[3px] bg-elevated z-50">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="relative z-10 max-w-[520px] mx-auto mt-[15vh] px-4 pb-16">
        <div className="rounded-2xl bg-surface border border-border/50 p-8">
          {getStepTitle() && (
            <div className="mb-8">
              <h1 className="font-display font-bold text-[28px] text-foreground tracking-tight leading-tight">
                {getStepTitle()}
              </h1>
              {getStepDescription() && (
                <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed">
                  {getStepDescription()}
                </p>
              )}
            </div>
          )}

          {currentStep === 'credentials' && (
            <StepCredentials onComplete={handleCredentialsComplete} />
          )}

          {currentStep === 'legal' && userId && (
            <StepLegal
              userId={userId}
              onComplete={handleLegalComplete}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}
