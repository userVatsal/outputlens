import { useState } from 'react';
import { Shield, FileText, CheckCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ProfileData } from '@/hooks/useProfile';
import { LEGAL_VERSIONS, isConsentUpToDate, getOutdatedDocuments } from '@/lib/legal';
import { format } from 'date-fns';

interface LegalSectionProps {
  profile: ProfileData;
  onAcceptConsent: (gdpr: boolean, privacyVersion: number, termsVersion: number) => Promise<boolean>;
}

export function LegalSection({ profile, onAcceptConsent }: LegalSectionProps) {
  const [updating, setUpdating] = useState(false);

  const consentState = {
    gdpr: profile.consent_gdpr,
    privacyVersion: profile.consent_privacy_version,
    termsVersion: profile.consent_terms_version,
    acceptedAt: profile.consent_accepted_at
  };

  const isUpToDate = isConsentUpToDate(consentState);
  const outdatedDocs = getOutdatedDocuments(consentState);

  const handleReConsent = async () => {
    setUpdating(true);
    try {
      await onAcceptConsent(
        true,
        LEGAL_VERSIONS.privacy_policy.version,
        LEGAL_VERSIONS.terms_of_service.version
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Privacy & Legal
        </CardTitle>
        <CardDescription>
          Manage your consent preferences and review legal agreements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Consent Status */}
        <div className="flex items-start justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-start gap-3">
            {isUpToDate ? (
              <CheckCircle className="h-5 w-5 text-bullish mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-caution mt-0.5" />
            )}
            <div>
              <p className="font-medium text-foreground">
                {isUpToDate ? 'Consent Up to Date' : 'Consent Update Required'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isUpToDate 
                  ? `Last accepted on ${profile.consent_accepted_at 
                      ? format(new Date(profile.consent_accepted_at), 'MMMM d, yyyy')
                      : 'signup'}`
                  : `Please review and accept the updated ${outdatedDocs.map(d => 
                      d === 'privacy_policy' ? 'Privacy Policy' : 'Terms of Service'
                    ).join(' and ')}`
                }
              </p>
            </div>
          </div>
          {!isUpToDate && (
            <Button onClick={handleReConsent} disabled={updating} size="sm">
              {updating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Accept Updates
            </Button>
          )}
        </div>

        {/* GDPR Consent Toggle */}
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div className="space-y-0.5">
            <Label htmlFor="gdpr-consent" className="text-sm font-medium">
              GDPR Data Processing Consent
            </Label>
            <p className="text-xs text-muted-foreground">
              Allow us to process your personal data in accordance with GDPR
            </p>
          </div>
          <Switch
            id="gdpr-consent"
            checked={profile.consent_gdpr}
            disabled={true}
            aria-label="GDPR consent toggle"
          />
        </div>

        {/* Legal Documents */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Legal Documents</h4>
          
          <div className="space-y-3">
            {/* Privacy Policy */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Privacy Policy</p>
                  <p className="text-xs text-muted-foreground">
                    Version {LEGAL_VERSIONS.privacy_policy.version} • 
                    Updated {LEGAL_VERSIONS.privacy_policy.updated}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {profile.consent_privacy_version >= LEGAL_VERSIONS.privacy_policy.version ? (
                  <Badge variant="outline" className="text-bullish border-bullish">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Accepted
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-caution border-caution">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Update
                  </Badge>
                )}
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/privacy">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Terms of Service */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Terms of Service</p>
                  <p className="text-xs text-muted-foreground">
                    Version {LEGAL_VERSIONS.terms_of_service.version} • 
                    Updated {LEGAL_VERSIONS.terms_of_service.updated}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {profile.consent_terms_version >= LEGAL_VERSIONS.terms_of_service.version ? (
                  <Badge variant="outline" className="text-bullish border-bullish">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Accepted
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-caution border-caution">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Update
                  </Badge>
                )}
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/terms">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Rights */}
        <div className="pt-4 border-t border-border space-y-3">
          <h4 className="text-sm font-medium text-foreground">Your Data Rights</h4>
          <p className="text-xs text-muted-foreground">
            Under GDPR, you have the right to access, rectify, or delete your personal data.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Request Data Export
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" disabled>
              Delete Account
            </Button>
          </div>
          <p className="text-xs text-muted-foreground italic">
            Data export and account deletion features coming soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
