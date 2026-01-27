import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { LEGAL_VERSIONS } from '@/lib/legal';

interface StepLegalProps {
  userId: string;
  onComplete: () => void;
  onBack: () => void;
}

export function StepLegal({ userId, onComplete, onBack }: StepLegalProps) {
  const [consentGdpr, setConsentGdpr] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const allChecked = consentGdpr && consentTerms && consentPrivacy;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!allChecked) {
      setError('Please accept all agreements to continue');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          consent_gdpr: consentGdpr,
          consent_terms_version: LEGAL_VERSIONS.terms_of_service.version,
          consent_privacy_version: LEGAL_VERSIONS.privacy_policy.version,
          consent_accepted_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      onComplete();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
      <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <Shield className="h-5 w-5 text-primary flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          We take your privacy seriously. Please review our policies before continuing.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
          <Checkbox
            id="gdpr"
            checked={consentGdpr}
            onCheckedChange={(checked) => setConsentGdpr(checked === true)}
            disabled={loading}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="gdpr"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              I consent to data processing (GDPR)
            </Label>
            <p className="text-xs text-muted-foreground">
              I understand that my data will be processed to provide the service and improve my experience.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
          <Checkbox
            id="terms"
            checked={consentTerms}
            onCheckedChange={(checked) => setConsentTerms(checked === true)}
            disabled={loading}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              I accept the Terms of Service
            </Label>
            <p className="text-xs text-muted-foreground">
              I have read and agree to the{' '}
              <Link to="/terms" target="_blank" className="text-primary hover:underline">
                Terms of Service
              </Link>
              {' '}(Version {LEGAL_VERSIONS.terms_of_service.version})
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
          <Checkbox
            id="privacy"
            checked={consentPrivacy}
            onCheckedChange={(checked) => setConsentPrivacy(checked === true)}
            disabled={loading}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="privacy"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              I accept the Privacy Policy
            </Label>
            <p className="text-xs text-muted-foreground">
              I have read and agree to the{' '}
              <Link to="/privacy" target="_blank" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              {' '}(Version {LEGAL_VERSIONS.privacy_policy.version})
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button type="submit" className="flex-1" disabled={loading || !allChecked}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </form>
  );
}
