import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AlertCircle, Loader2, ShieldAlert, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { toast } from 'sonner';
import { useSecurity } from '@/hooks/useSecurity';
import { CaptchaGate } from '@/components/security/CaptchaGate';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/\d/, 'Password must contain a number');

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: passwordSchema,
});

const ROTATING_QUOTES = [
  { q: 'Showed me a bimodal distribution on what I thought was a straightforward position. Resized before the move.', a: 'James W., Head of Quant Risk' },
  { q: 'Regime detection picked up a vol shift four hours before our internal signal.', a: 'Priya S., Senior PM' },
  { q: 'First tool that treats risk like a distribution instead of a single number.', a: 'Marcus T., Risk Lead' },
];

const ROLES = ['Portfolio Manager', 'Risk Analyst', 'Quant Researcher', 'Trader', 'Student', 'Other'];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  );
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [role, setRole] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);

  const {
    checkSecurity, handleCaptchaVerify, logEvent,
    captchaType, captchaVerified, isBlocked, resetCaptcha,
  } = useSecurity();
  const [showCaptcha, setShowCaptcha] = useState(false);
  const pendingSubmitRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setQuoteIdx((i) => (i + 1) % ROTATING_QUOTES.length), 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.title = mode === 'signup' ? 'Sign Up — OutputLens' : 'Sign In — OutputLens';
  }, [mode]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        if (sessionStorage.getItem('ol_just_signed_up') === '1') {
          sessionStorage.removeItem('ol_just_signed_up');
          navigate('/welcome');
          return;
        }
        const { data: profile } = await supabase
          .from('profiles').select('onboarding_completed').eq('user_id', session.user.id).single();
        navigate(profile?.onboarding_completed ? '/dashboard' : '/onboarding');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        if (sessionStorage.getItem('ol_just_signed_up') === '1') {
          sessionStorage.removeItem('ol_just_signed_up');
          navigate('/welcome');
          return;
        }
        const { data: profile } = await supabase
          .from('profiles').select('onboarding_completed').eq('user_id', session.user.id).single();
        navigate(profile?.onboarding_completed ? '/dashboard' : '/onboarding');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    try {
      (mode === 'signup' ? signUpSchema : signInSchema).parse({ email, password });
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) setError(err.errors[0].message);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup' && signupStep === 1) {
      try {
        z.string().email('Please enter a valid email address').parse(email);
        setSignupStep(2);
      } catch (err) {
        if (err instanceof z.ZodError) setError(err.errors[0].message);
      }
      return;
    }

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
        sessionStorage.setItem('ol_just_signed_up', '1');
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/welcome`,
            data: { onboarding_completed: false, role },
          },
        });
        if (error) {
          sessionStorage.removeItem('ol_just_signed_up');
          setError(error.message.includes('already registered')
            ? 'This email is already registered. Please sign in instead.'
            : error.message);
          await logEvent('failed_signup', 'low', 'signup', { email });
          return;
        }
        supabase.functions.invoke('send-welcome-email', { body: { email } })
          .catch((err) => console.error('Welcome email failed:', err));
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
    } catch {
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
    setEmail(''); setPassword(''); setRole('');
    setSignupStep(1); setError(null);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[55fr_45fr] bg-background">
      {/* LEFT — form panel */}
      <div className="flex flex-col justify-center px-6 sm:px-12 py-12 bg-background relative">
        <div className="w-full max-w-[400px] mx-auto px-2 sm:px-8 py-4">
          <Link to="/" className="font-display text-lg font-bold tracking-tight flex items-center gap-2 mb-10">
            <span className="block w-1.5 h-1.5 bg-primary rounded-sm shadow-[0_0_8px_hsl(var(--primary)/0.6)]" aria-hidden />
            <span><span className="text-foreground">Output</span><span className="text-primary">Lens</span></span>
          </Link>

          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-[28px] font-bold text-foreground leading-tight tracking-tight">
                {mode === 'signin'
                  ? 'Welcome back.'
                  : signupStep === 1 ? 'Start analysing risk.' : 'One last thing.'}
              </h1>
              <p className="mt-1 text-[14px] text-muted-foreground">
                {mode === 'signin'
                  ? 'Your simulations are waiting.'
                  : signupStep === 1 ? 'Free. No card required.' : "Tell us how you'll use OutputLens."}
              </p>
            </div>
            {mode === 'signup' && (
              <div className="flex-shrink-0 text-right">
                <div className="text-foreground/60 text-base">
                  <span className="text-primary">●</span>{' '}
                  <span className={signupStep === 2 ? 'text-primary' : 'text-muted-foreground'}>{signupStep === 2 ? '●' : '○'}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 uppercase" style={{ letterSpacing: '0.06em' }}>
                  Step {signupStep} of 2
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isBlocked && (
              <div className="flex items-start gap-3 p-3 rounded bg-destructive/10 border border-destructive/20">
                <ShieldAlert className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Access Temporarily Blocked</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Too many failed attempts. Try again in 15 minutes.</p>
                </div>
              </div>
            )}

            {showCaptcha && !captchaVerified && (
              <div className="p-3 rounded bg-primary/5 border border-primary/20">
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
              <div className="flex items-center gap-2 p-2.5 rounded bg-bullish/10 border border-bullish/20">
                <ShieldCheck className="h-4 w-4 text-bullish" />
                <span className="text-sm text-bullish">Security check passed</span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {(mode === 'signin' || signupStep === 1) && (
              <Field label="Work Email">
                <input
                  id="email" type="email" autoComplete="email"
                  placeholder="you@firm.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  disabled={loading} required className="auth-input"
                />
              </Field>
            )}

            {mode === 'signup' && signupStep === 2 && (
              <>
                <div className="rounded-lg bg-elevated border border-border px-3.5 py-2.5 text-sm flex items-center justify-between">
                  <span className="font-mono text-foreground/80 truncate">{email}</span>
                  <button type="button" onClick={() => setSignupStep(1)} className="text-primary text-xs hover:underline">Change</button>
                </div>
                <Field label="I am a...">
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map((r) => {
                      const selected = role === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`rounded-lg px-4 py-2 text-[13px] cursor-pointer transition-all border ${
                            selected
                              ? 'border-primary bg-primary/10 text-primary font-medium'
                              : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                          }`}
                          style={selected ? { backgroundColor: 'hsl(var(--primary) / 0.08)' } : undefined}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </>
            )}

            {(mode === 'signin' || (mode === 'signup' && signupStep === 2)) && (
              <Field
                label="Password"
                right={mode === 'signin' ? (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!email) { setError('Please enter your email address first'); return; }
                      setLoading(true);
                      await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: `${window.location.origin}/auth?reset=true`,
                      });
                      setLoading(false);
                      toast.success("If an account exists with this email, you'll receive a reset link.");
                    }}
                    className="text-[11px] text-muted-foreground hover:text-primary transition-colors normal-case"
                    style={{ letterSpacing: 'normal' }}
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                ) : undefined}
              >
                <div className="relative">
                  <input
                    id="password" type={showPw ? 'text' : 'password'}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    disabled={loading} required
                    className="auth-input pr-10"
                  />
                  <button
                    type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="mt-1.5 text-xs text-muted-foreground">8+ chars with uppercase, lowercase, and a number</p>
                )}
              </Field>
            )}

            <button
              type="submit"
              disabled={loading || isBlocked || (mode === 'signup' && signupStep === 2 && !role)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold text-[15px] h-[50px] px-5 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_4px_16px_hsl(var(--primary)/0.3)]"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> {mode === 'signup' ? 'Creating account…' : 'Signing in…'}</>
              ) : isBlocked ? (
                <><ShieldAlert className="h-4 w-4" /> Access blocked</>
              ) : mode === 'signin' ? (
                'Sign In →'
              ) : signupStep === 1 ? (
                'Continue →'
              ) : (
                'Create Account & Run First Simulation →'
              )}
            </button>

            {(mode === 'signin' || signupStep === 1) && (
              <>
                <div className="relative my-1">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-3 text-[11px] text-muted-foreground uppercase" style={{ letterSpacing: '0.06em' }}>or</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-elevated border border-border text-foreground font-medium text-[14px] h-[46px] px-5 hover:border-foreground/20 transition-colors"
                  disabled={loading || isBlocked}
                  onClick={async () => {
                    setLoading(true);
                    const { lovable } = await import('@/integrations/lovable');
                    const result = await lovable.auth.signInWithOAuth('google', {
                      redirect_uri: `${window.location.origin}/dashboard`,
                    });
                    if (result.error) {
                      console.error('Google sign-in error:', result.error);
                      setLoading(false);
                    }
                  }}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>
              </>
            )}

            <p className="text-center text-[11px] text-muted-foreground/60 pt-2 mt-4">
              By continuing you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">Terms</Link> and{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </form>

          <p className="text-center text-[13px] text-muted-foreground mt-6">
            {mode === 'signin' ? (
              <>Don't have an account?{' '}
                <button onClick={() => switchMode('signup')} className="text-primary font-medium hover:underline">Start free</button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => switchMode('signin')} className="text-primary font-medium hover:underline">Sign in</button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* RIGHT — social proof */}
      <div
        className="hidden md:flex flex-col justify-center relative bg-surface border-l border-border/40 px-12 py-16 overflow-hidden"
        style={{ background: 'hsl(var(--surface))' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, hsl(189 100% 50% / 0.06), transparent)' }}
        />
        <div className="relative max-w-md mx-auto w-full">
          <div className="relative min-h-[200px]">
            {ROTATING_QUOTES.map((quote, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-all duration-700"
                style={{
                  opacity: i === quoteIdx ? 1 : 0,
                  transform: i === quoteIdx ? 'translateY(0)' : 'translateY(8px)',
                  pointerEvents: i === quoteIdx ? 'auto' : 'none',
                }}
              >
                <blockquote
                  className="text-[18px] text-foreground leading-[1.65] font-medium before:content-['\201C'] before:text-primary before:text-[36px] before:font-display before:leading-none before:block before:mb-3"
                >
                  {quote.q}
                </blockquote>
                <div className="mt-4 text-[13px] text-muted-foreground">
                  {(() => {
                    const [name, ...rest] = quote.a.split(',');
                    const role = rest.join(',').trim();
                    return (
                      <>
                        <div className="text-foreground font-medium">{name}</div>
                        {role && <div className="mt-0.5">{role}</div>}
                      </>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-border/40 grid grid-cols-3 gap-4">
            {[
              { v: '10,000', l: 'simulations' },
              { v: '2,400+', l: 'analysts' },
              { v: '<0.3s', l: 'results' },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-mono text-primary text-[13px] tabular-nums">{s.v}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 uppercase" style={{ letterSpacing: '0.06em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, right, children }: { label: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-[11px] font-semibold uppercase text-muted-foreground" style={{ letterSpacing: '0.05em' }}>{label}</label>
        {right}
      </div>
      {children}
    </div>
  );
}