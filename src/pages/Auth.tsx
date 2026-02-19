import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2, ShieldAlert, ShieldCheck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';
import { LEGAL_VERSIONS } from '@/lib/legal';
import { useSecurity } from '@/hooks/useSecurity';
import { CaptchaGate } from '@/components/security/CaptchaGate';
import { differenceInYears } from 'date-fns';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/\d/, 'Password must contain a number');

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const quickSignUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: passwordSchema,
});

const valueProps = [
  '10,000 Monte Carlo simulation paths',
  'Live market data integration',
  'AI-powered scenario interpretation',
  'VaR, CVaR & tail risk metrics',
];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    checkSecurity,
    handleCaptchaVerify,
    logEvent,
    captchaRequired,
    captchaType,
    captchaVerified,
    isBlocked,
    resetCaptcha
  } = useSecurity();
  const [showCaptcha, setShowCaptcha] = useState(false);
  const pendingSubmitRef = useRef(false);

  useEffect(() => {
    document.title = mode === 'signup'
      ? 'Sign Up - OutputLens Risk Analysis Platform'
      : 'Sign In - OutputLens Risk Analysis Platform';
  }, [mode]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('user_id', session.user.id)
          .single();
        if (profile?.onboarding_completed) navigate('/dashboard');
        else navigate('/onboarding');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('user_id', session.user.id)
            .single();
          if (profile?.onboarding_completed) navigate('/dashboard');
          else navigate('/onboarding');
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    try {
      if (mode === 'signup') {
        quickSignUpSchema.parse({ email, password });
      } else {
        signInSchema.parse({ email, password });
      }
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) setError(err.errors[0].message);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;

    const endpoint = mode === 'signup' ? 'signup' : 'login';
    const analysis = await checkSecurity(endpoint);

    if (analysis.blocked) {
      setError(analysis.blockReason || 'Access temporarily blocked. Please try again later.');
      return;
    }
    if (analysis.captchaRequired && !captchaVerified) {
      setShowCaptcha(true);
      pendingSubmitRef.current = true;
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { onboarding_completed: false },
          },
        });
        if (error) {
          setError(error.message.includes('already registered')
            ? 'This email is already registered. Please sign in instead.'
            : error.message);
          await logEvent('failed_signup', 'low', 'signup', { email });
          return;
        }
        supabase.functions.invoke('send-welcome-email', { body: { email } })
          .catch(err => console.error('Welcome email failed:', err));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message.includes('Invalid login credentials')
            ? 'Invalid email or password. Please try again.'
            : error.message);
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

  const handleCaptchaSuccess = async (token: string) => {
    const verified = await handleCaptchaVerify(token, mode === 'signup' ? 'signup' : 'login');
    if (verified && pendingSubmitRef.current) {
      pendingSubmitRef.current = false;
      setShowCaptcha(false);
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    }
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setEmail('');
    setPassword('');
    setError(null);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-5">
      {/* LEFT PANEL — Brand */}
      <div
        className="hidden lg:flex lg:col-span-2 flex-col justify-between p-10"
        style={{ backgroundColor: 'hsl(var(--brand-navy))' }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 w-fit">
          <img src={logo} alt="OutputLens" className="h-8 brightness-0 invert" />
        </Link>

        {/* Hero quote */}
        <div className="space-y-8">
          <blockquote className="text-3xl font-bold leading-tight text-white">
            "Know your risk before you risk your money."
          </blockquote>
          <ul className="space-y-3">
            {valueProps.map((prop) => (
              <li key={prop} className="flex items-center gap-3 text-white/70 text-sm">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </span>
                {prop}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer links */}
        <div className="flex items-center gap-4 text-white/40 text-xs">
          <Link to="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
          <span>·</span>
          <Link to="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
          <span>·</span>
          <span>© {new Date().getFullYear()} OutputLens</span>
        </div>
      </div>

      {/* RIGHT PANEL — Form */}
      <div className="lg:col-span-3 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 bg-background">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link to="/">
            <img src={logo} alt="OutputLens" className="h-8" />
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {mode === 'signup'
                ? 'Start with a free analysis — no credit card required.'
                : 'Your risk intelligence is waiting.'}
            </p>
          </div>

          {/* Mode toggle tabs */}
          <div className="flex border border-border rounded-lg p-1 mb-6 bg-muted/30">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'signin'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Security states */}
            {isBlocked && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <ShieldAlert className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Access Temporarily Blocked</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Too many failed attempts. Please try again in 15 minutes.</p>
                </div>
              </div>
            )}

            {showCaptcha && !captchaVerified && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <CaptchaGate
                  action={mode === 'signup' ? 'signup' : 'login'}
                  captchaType={captchaType}
                  onVerified={handleCaptchaSuccess}
                  onError={(err) => setError(err)}
                  onExpired={() => { resetCaptcha(); setShowCaptcha(false); }}
                />
              </div>
            )}

            {captchaVerified && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Security check passed</span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 border-border/70 focus:border-primary"
                disabled={loading}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!email) { setError('Please enter your email address first'); return; }
                      setLoading(true);
                      await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: `${window.location.origin}/auth?reset=true`,
                      });
                      setLoading(false);
                      setError(null);
                      toast.success("If an account exists with this email, you'll receive a reset link.");
                    }}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 border-border/70 focus:border-primary"
                disabled={loading}
                required
              />
              {mode === 'signup' && (
                <p className="text-xs text-muted-foreground">
                  8+ chars with uppercase, lowercase, and a number
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-10 font-semibold mt-2"
              disabled={loading || isBlocked}
              style={{ backgroundColor: 'hsl(var(--brand-navy))' }}
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{mode === 'signup' ? 'Creating account...' : 'Signing in...'}</>
              ) : isBlocked ? (
                <><ShieldAlert className="mr-2 h-4 w-4" />Access Blocked</>
              ) : (
                mode === 'signup' ? 'Create Account' : 'Sign In'
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs text-muted-foreground uppercase tracking-wider">or</span>
              </div>
            </div>

            {/* Google OAuth */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-10"
              disabled={loading || isBlocked}
              onClick={async () => {
                setLoading(true);
                await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: `${window.location.origin}/dashboard` },
                });
                setLoading(false);
              }}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </Button>

            {/* Legal */}
            <p className="text-center text-xs text-muted-foreground pt-1">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
