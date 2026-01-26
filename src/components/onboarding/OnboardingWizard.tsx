import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { StepCredentials } from './StepCredentials';
import { StepProfile } from './StepProfile';
import { StepLegal } from './StepLegal';
import { StepWelcome } from './StepWelcome';
import { StepComplete } from './StepComplete';

export type OnboardingStep = 'credentials' | 'profile' | 'legal' | 'welcome' | 'complete';

interface OnboardingWizardProps {
  initialStep?: OnboardingStep;
}

const STEPS: OnboardingStep[] = ['credentials', 'profile', 'legal', 'welcome', 'complete'];

export function OnboardingWizard({ initialStep = 'credentials' }: OnboardingWizardProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(initialStep);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

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
          setCurrentStep('profile');
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

  const handleProfileComplete = (name: string) => {
    setUserName(name);
    handleNext();
  };

  const handleComplete = () => {
    navigate('/dashboard');
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'credentials':
        return 'Create Your Account';
      case 'profile':
        return 'Tell Us About Yourself';
      case 'legal':
        return 'Legal Agreements';
      case 'welcome':
        return '';
      case 'complete':
        return 'Complete Your Profile';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'credentials':
        return 'Start with your email and password';
      case 'profile':
        return 'Your personal details help us personalize your experience';
      case 'legal':
        return 'Please review and accept our policies';
      case 'welcome':
        return '';
      case 'complete':
        return 'Add your photo and bio (optional)';
      default:
        return '';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress indicator - hide on welcome step */}
      {currentStep !== 'welcome' && (
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStepIndex + 1} of {STEPS.length}</span>
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
      
      {currentStep === 'profile' && userId && (
        <StepProfile 
          userId={userId} 
          onComplete={handleProfileComplete} 
          onBack={handleBack}
        />
      )}
      
      {currentStep === 'legal' && userId && (
        <StepLegal 
          userId={userId} 
          onComplete={handleNext} 
          onBack={handleBack}
        />
      )}
      
      {currentStep === 'welcome' && (
        <StepWelcome 
          userName={userName} 
          onComplete={handleNext}
        />
      )}
      
      {currentStep === 'complete' && userId && (
        <StepComplete 
          userId={userId} 
          onComplete={handleComplete}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
