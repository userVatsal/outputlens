import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
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
        return '5 free analyses/month • No credit card • Start in 30 seconds';
      case 'legal':
        return 'Quick legal agreements, then you\'re ready to analyze';
      case 'complete':
        return '';
      default:
        return '';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress indicator */}
      {currentStep !== 'complete' && (
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStepIndex + 1} of {STEPS.length - 1}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Step title */}
      {getStepTitle() && (
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">{getStepTitle()}</h1>
          {getStepDescription() && (
            <p className="mt-2 text-muted-foreground">{getStepDescription()}</p>
          )}
        </div>
      )}

      {/* Step content */}
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
  );
}
