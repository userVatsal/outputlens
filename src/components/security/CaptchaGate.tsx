import { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";

// hCaptcha site key - use test key if not configured
const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-000000000001";

interface CaptchaGateProps {
  action: "login" | "signup" | "analyze" | "api_call";
  captchaType?: "invisible" | "checkbox" | "puzzle";
  onVerified: (token: string) => void;
  onError?: (error: string) => void;
  onExpired?: () => void;
  className?: string;
}

declare global {
  interface Window {
    hcaptcha?: {
      render: (container: HTMLElement, params: any) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onHcaptchaLoad?: () => void;
  }
}

export function CaptchaGate({
  action,
  captchaType = "invisible",
  onVerified,
  onError,
  onExpired,
  className = "",
}: CaptchaGateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load hCaptcha script if not already loaded
    if (!window.hcaptcha) {
      const script = document.createElement("script");
      script.src = "https://js.hcaptcha.com/1/api.js?render=explicit";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        initCaptcha();
      };

      script.onerror = () => {
        setError("Failed to load captcha");
        setIsLoading(false);
      };

      document.head.appendChild(script);
    } else {
      initCaptcha();
    }

    return () => {
      // Cleanup widget on unmount
      if (widgetIdRef.current && window.hcaptcha) {
        try {
          window.hcaptcha.remove(widgetIdRef.current);
        } catch {
          // Widget may already be removed
        }
      }
    };
  }, []);

  const initCaptcha = () => {
    if (!containerRef.current || !window.hcaptcha) {
      // Retry after a short delay if hcaptcha not ready
      setTimeout(initCaptcha, 100);
      return;
    }

    try {
      const size = captchaType === "invisible" ? "invisible" : "normal";
      
      widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
        sitekey: HCAPTCHA_SITE_KEY,
        size,
        theme: "dark",
        callback: (token: string) => {
          onVerified(token);
        },
        "expired-callback": () => {
          onExpired?.();
          setError("Captcha expired, please try again");
        },
        "error-callback": (err: string) => {
          onError?.(err);
          setError("Captcha error, please try again");
        },
      });

      setIsLoading(false);

      // Auto-execute for invisible captcha
      if (captchaType === "invisible" && widgetIdRef.current) {
        window.hcaptcha.execute(widgetIdRef.current);
      }
    } catch (err) {
      console.error("[CaptchaGate] Init error:", err);
      setError("Failed to initialize captcha");
      setIsLoading(false);
    }
  };

  /**
   * Execute the captcha (for invisible mode)
   */
  const execute = () => {
    if (widgetIdRef.current && window.hcaptcha) {
      window.hcaptcha.execute(widgetIdRef.current);
    }
  };

  /**
   * Reset the captcha
   */
  const reset = () => {
    if (widgetIdRef.current && window.hcaptcha) {
      window.hcaptcha.reset(widgetIdRef.current);
      setError(null);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <ShieldAlert className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading && captchaType !== "invisible") {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading security check...</span>
      </div>
    );
  }

  return (
    <div className={className}>
      {captchaType !== "invisible" && (
        <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          <span>Please complete the security check</span>
        </div>
      )}
      <div ref={containerRef} />
    </div>
  );
}

export default CaptchaGate;
