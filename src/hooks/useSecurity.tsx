import { useState, useCallback, useEffect } from "react";
import { 
  ThreatAnalysis, 
  analyzeRequest, 
  verifyCaptcha, 
  logSecurityEvent, 
  getIpStatus 
} from "@/lib/security";

interface SecurityState {
  isBlocked: boolean;
  captchaRequired: boolean;
  captchaType?: "invisible" | "checkbox" | "puzzle";
  threatScore: number;
  ipReputation: number;
  isLoading: boolean;
  error: string | null;
}

export function useSecurity() {
  const [state, setState] = useState<SecurityState>({
    isBlocked: false,
    captchaRequired: false,
    threatScore: 0,
    ipReputation: 50,
    isLoading: false,
    error: null,
  });

  const [captchaVerified, setCaptchaVerified] = useState(false);

  /**
   * Check security status before an action
   */
  const checkSecurity = useCallback(async (
    endpoint: string,
    userId?: string,
    metadata?: Record<string, unknown>
  ): Promise<ThreatAnalysis> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const analysis = await analyzeRequest(endpoint, userId, metadata);

      setState({
        isBlocked: analysis.blocked,
        captchaRequired: analysis.captchaRequired,
        captchaType: analysis.captchaType,
        threatScore: analysis.threatScore,
        ipReputation: analysis.ipReputation,
        isLoading: false,
        error: analysis.blocked ? analysis.blockReason || "Access blocked" : null,
      });

      return analysis;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Security check failed",
      }));

      // Return allow by default on error to not block legitimate users
      return {
        threatScore: 0,
        action: "allow",
        captchaRequired: false,
        blocked: false,
        ipReputation: 50,
        rateLimit: { allowed: true, remaining: 30, resetIn: 60 },
      };
    }
  }, []);

  /**
   * Verify captcha token
   */
  const handleCaptchaVerify = useCallback(async (
    token: string,
    endpoint?: string,
    userId?: string
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await verifyCaptcha(token, endpoint, userId);

      if (result.success) {
        setCaptchaVerified(true);
        setState(prev => ({
          ...prev,
          captchaRequired: false,
          isLoading: false,
          error: null,
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || "Captcha verification failed",
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "Verification failed",
      }));
      return false;
    }
  }, []);

  /**
   * Log a security event (e.g., failed login)
   */
  const logEvent = useCallback(async (
    eventType: string,
    severity: "low" | "medium" | "high" | "critical",
    endpoint?: string,
    metadata?: Record<string, unknown>,
    userId?: string
  ) => {
    await logSecurityEvent({ eventType, severity, endpoint, metadata }, userId);
  }, []);

  /**
   * Reset captcha verification state
   */
  const resetCaptcha = useCallback(() => {
    setCaptchaVerified(false);
    setState(prev => ({ ...prev, captchaRequired: false }));
  }, []);

  /**
   * Check IP status on mount (optional)
   */
  const checkIpStatus = useCallback(async () => {
    try {
      const status = await getIpStatus();
      setState(prev => ({
        ...prev,
        isBlocked: status.blocked,
        ipReputation: status.reputation,
      }));
      return status;
    } catch {
      return null;
    }
  }, []);

  return {
    ...state,
    captchaVerified,
    checkSecurity,
    handleCaptchaVerify,
    logEvent,
    resetCaptcha,
    checkIpStatus,
  };
}
