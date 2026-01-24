// Legal document version tracking for GDPR compliance
// Update these versions when policies change to trigger re-consent prompts

export const LEGAL_VERSIONS = {
  privacy_policy: {
    version: 3,
    updated: '2025-01-24',
    url: '/privacy',
    summary: 'Updated data processing and third-party sharing disclosures.'
  },
  terms_of_service: {
    version: 2,
    updated: '2025-01-24',
    url: '/terms',
    summary: 'Updated subscription terms and usage policies.'
  }
} as const;

export type LegalDocumentType = keyof typeof LEGAL_VERSIONS;

export interface ConsentState {
  gdpr: boolean;
  privacyVersion: number;
  termsVersion: number;
  acceptedAt: string | null;
}

export function isConsentUpToDate(consent: ConsentState): boolean {
  return (
    consent.gdpr &&
    consent.privacyVersion >= LEGAL_VERSIONS.privacy_policy.version &&
    consent.termsVersion >= LEGAL_VERSIONS.terms_of_service.version
  );
}

export function getOutdatedDocuments(consent: ConsentState): LegalDocumentType[] {
  const outdated: LegalDocumentType[] = [];
  
  if (consent.privacyVersion < LEGAL_VERSIONS.privacy_policy.version) {
    outdated.push('privacy_policy');
  }
  if (consent.termsVersion < LEGAL_VERSIONS.terms_of_service.version) {
    outdated.push('terms_of_service');
  }
  
  return outdated;
}
