import { Link } from 'react-router-dom';
import { AlertCircle, User, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AgeVerificationBannerProps {
  onDismiss?: () => void;
}

export function AgeVerificationBanner({ onDismiss }: AgeVerificationBannerProps) {
  return (
    <Alert className="border-amber-500/30 bg-amber-500/5">
      <AlertCircle className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-amber-600">Complete Your Profile</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm text-muted-foreground mb-3">
          To access advanced features like leverage analysis and derivatives risk modeling, 
          please verify your date of birth in your account settings.
        </p>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link to="/account">
              <User className="h-4 w-4 mr-1.5" />
              Complete Profile
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
          {onDismiss && (
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
