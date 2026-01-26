import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { differenceInYears } from 'date-fns';
import logo from '@/assets/logo.png';
import { LEGAL_VERSIONS } from '@/lib/legal';
import { useSecurity } from '@/hooks/useSecurity';
import { CaptchaGate } from '@/components/security/CaptchaGate';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Quick signup schema - only email and password required
const quickSignUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Full signup schema - for complete profile (deferred)
const fullSignUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  dateOfBirth: z.string().refine((val) => {
    if (!val) return false;
    const date = new Date(val);
    const age = differenceInYears(new Date(), date);
    return age >= 18;
  }, 'You must be at least 18 years old'),
  consentGdpr: z.boolean().refine(val => val === true, 'GDPR consent is required'),
  consentTerms: z.boolean().refine(val => val === true, 'You must accept Terms of Service'),
  consentPrivacy: z.boolean().refine(val => val === true, 'You must accept Privacy Policy'),
});

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  );
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [consentGdpr, setConsentGdpr] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Security state
  const { 
    checkSecurity, 
    handleCaptchaVerify, 
    logEvent, 
    captchaRequired, 
    captchaType, 
    captchaVerified,
    isBlocked,
    threatScore,
    error: securityError,
    resetCaptcha
  } = useSecurity();
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const pendingSubmitRef = useRef(false);

  // SEO: Set page-specific document title
  useEffect(() => {
    document.title = mode === 'signup' 
      ? 'Sign Up - OutputLens Risk Analysis Platform' 
      : 'Sign In - OutputLens Risk Analysis Platform';
  }, [mode]);

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate('/dashboard');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    try {
      if (mode === 'signup') {
        // Quick signup: only validate email and password
        quickSignUpSchema.parse({
          email,
          password,
        });
      } else {
        signInSchema.parse({ email, password });
      }
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    // Check security before submitting
    const endpoint = mode === 'signup' ? 'signup' : 'login';
    const analysis = await checkSecurity(endpoint);

    // If blocked, show error
    if (analysis.blocked) {
      setError(analysis.blockReason || 'Access temporarily blocked. Please try again later.');
      return;
    }

    // If captcha required and not yet verified
    if (analysis.captchaRequired && !captchaVerified) {
      setShowCaptcha(true);
      pendingSubmitRef.current = true;
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        // Quick signup - only send email and password, profile will be completed later
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              // Minimal data for quick signup - user will complete profile later
              onboarding_completed: false
            },
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            setError('This email is already registered. Please sign in instead.');
          } else {
            setError(error.message);
          }
          // Log failed signup attempt
          await logEvent('failed_signup', 'low', 'signup', { email });
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else {
            setError(error.message);
          }
          // Log failed login attempt (this affects IP reputation)
          await logEvent('failed_login', 'medium', 'login', { email });
          return;
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle captcha verification
  const handleCaptchaSuccess = async (token: string) => {
    setCaptchaToken(token);
    const verified = await handleCaptchaVerify(token, mode === 'signup' ? 'signup' : 'login');
    
    if (verified && pendingSubmitRef.current) {
      pendingSubmitRef.current = false;
      setShowCaptcha(false);
      // Re-trigger submit
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSubmit(fakeEvent);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setDateOfBirth('');
    setConsentGdpr(false);
    setConsentTerms(false);
    setConsentPrivacy(false);
    setError(null);
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="section-container py-4">
          <Link to="/" className="flex items-center w-fit">
            <img src={logo} alt="OutputLens" className="h-8" />
          </Link>
        </div>
      </header>

      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {mode === 'signup'
                ? 'Get your first analysis free. See how your trades might perform before you enter.'
                : 'Your trade scenarios are waiting.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
            {/* Blocked state */}
            {isBlocked && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <ShieldAlert className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Access Temporarily Blocked</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Too many failed attempts. Please try again in 15 minutes.
                  </p>
                </div>
              </div>
            )}

            {/* Captcha challenge */}
            {showCaptcha && !captchaVerified && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <CaptchaGate
                  action={mode === 'signup' ? 'signup' : 'login'}
                  captchaType={captchaType}
                  onVerified={handleCaptchaSuccess}
                  onError={(err) => setError(err)}
                  onExpired={() => {
                    resetCaptcha();
                    setShowCaptcha(false);
                  }}
                />
              </div>
            )}

            {/* Captcha verified indicator */}
            {captchaVerified && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">Security check passed</span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="trading-input"
                disabled={loading}
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="trading-input"
                disabled={loading}
                required
              />
            </div>

            {/* Quick signup info */}
            {mode === 'signup' && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 inline mr-2 text-primary" />
                  Quick signup - you'll complete your profile after your first analysis.
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || isBlocked}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                </>
              ) : isBlocked ? (
                <>
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  Access Blocked
                </>
              ) : (
                <>{mode === 'signup' ? 'Create Account' : 'Sign In'}</>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {mode === 'signup' ? (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign up
                    </button>
                  </>
                )}
              </p>
            </div>
          </form>

          {mode === 'signin' && (
            <p className="text-center text-xs text-muted-foreground">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
