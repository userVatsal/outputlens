import { ReactNode } from 'react';
import { BehaviorTrackingProvider, useTracking } from '@/hooks/useBehaviorTracking';
import { ExitSurveyModal } from './ExitSurveyModal';

function TrackingOverlays() {
  const { showExitSurvey, submitExitSurvey, dismissExitSurvey } = useTracking();

  if (!showExitSurvey) return null;

  return (
    <ExitSurveyModal
      onSubmit={submitExitSurvey}
      onDismiss={dismissExitSurvey}
    />
  );
}

interface TrackingProviderProps {
  children: ReactNode;
}

export function TrackingProvider({ children }: TrackingProviderProps) {
  return (
    <BehaviorTrackingProvider>
      {children}
      <TrackingOverlays />
    </BehaviorTrackingProvider>
  );
}
