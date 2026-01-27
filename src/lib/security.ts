/**
 * Security utilities and types for SentinelAI integration
 */

const DEFAULT_TIMEOUT_MS = 8000;

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const mergedInit: RequestInit = {
      ...init,
      signal: controller.signal,
    };
    return await fetch(input, mergedInit);
  } finally {
    clearTimeout(timeout);
  }
}

export interface ThreatAnalysis {
  threatScore: number;
  action: "allow" | "challenge" | "block";
  captchaRequired: boolean;
  captchaType?: "invisible" | "checkbox" | "puzzle";
  blocked: boolean;
  blockReason?: string;
  ipReputation: number;
  rateLimit: {
    allowed: boolean;
    remaining: number;
    resetIn: number;
  };
}

export interface SecurityEvent {
  eventType: string;
  severity: "low" | "medium" | "high" | "critical";
  endpoint?: string;
  metadata?: Record<string, unknown>;
}

export interface CaptchaVerification {
  success: boolean;
  score?: number;
  error?: string;
  development?: boolean;
}

/**
 * Analyze a request for potential threats
 */
export async function analyzeRequest(
  endpoint: string,
  userId?: string,
  metadata?: Record<string, unknown>
): Promise<ThreatAnalysis> {
  try {
    const response = await fetchWithTimeout(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sentinel-ai`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          action: "analyze",
          endpoint,
          userId,
          metadata,
        }),
      }
    );

    if (!response.ok) {
      console.error("[Security] Analysis failed:", response.status);
      return defaultAllowResponse();
    }

    return await response.json();
  } catch (error) {
    console.error("[Security] Analysis error:", error);
    return defaultAllowResponse();
  }
}

/**
 * Verify a captcha token
 */
export async function verifyCaptcha(
  token: string,
  endpoint?: string,
  userId?: string
): Promise<CaptchaVerification> {
  try {
    const response = await fetchWithTimeout(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sentinel-ai`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          action: "verify-captcha",
          captchaToken: token,
          endpoint,
          userId,
        }),
      }
    );

    return await response.json();
  } catch (error) {
    console.error("[Security] Captcha verification error:", error);
    return { success: false, error: "Verification service unavailable" };
  }
}

/**
 * Log a security event
 */
export async function logSecurityEvent(event: SecurityEvent, userId?: string): Promise<void> {
  try {
    await fetchWithTimeout(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sentinel-ai`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          action: "log-event",
          eventType: event.eventType,
          severity: event.severity,
          endpoint: event.endpoint,
          metadata: event.metadata,
          userId,
        }),
      },
      4000
    );
  } catch (error) {
    console.error("[Security] Log event error:", error);
  }
}

/**
 * Get current IP status
 */
export async function getIpStatus(): Promise<{
  ip: string;
  reputation: number;
  blocked: boolean;
  blockedUntil?: string;
}> {
  try {
    const response = await fetchWithTimeout(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sentinel-ai`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ action: "ip-status" }),
      },
      4000
    );

    return await response.json();
  } catch (error) {
    console.error("[Security] IP status error:", error);
    return { ip: "unknown", reputation: 50, blocked: false };
  }
}

function defaultAllowResponse(): ThreatAnalysis {
  return {
    threatScore: 0,
    action: "allow",
    captchaRequired: false,
    blocked: false,
    ipReputation: 50,
    rateLimit: { allowed: true, remaining: 30, resetIn: 60 },
  };
}
