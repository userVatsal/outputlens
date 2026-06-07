import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type Status = 'pending' | 'pass' | 'fail' | 'warn';

interface Check {
  id: string;
  label: string;
  status: Status;
  detail: string;
}

const INITIAL: Check[] = [
  { id: 'ua', label: 'User agent', status: 'pending', detail: '' },
  { id: 'ios', label: 'iOS device detection', status: 'pending', detail: '' },
  { id: 'safari', label: 'Safari detection', status: 'pending', detail: '' },
  { id: 'popup', label: 'Popup test', status: 'pending', detail: '' },
  { id: 'session', label: 'Supabase session reachable', status: 'pending', detail: '' },
  { id: 'oauth', label: 'OAuth URL generation', status: 'pending', detail: '' },
  { id: 'storage', label: 'localStorage available', status: 'pending', detail: '' },
];

export default function AuthDiagnostic() {
  const [checks, setChecks] = useState<Check[]>(INITIAL);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    document.title = 'Sign-in Diagnostic | OutputLens';
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCheck = (id: string, status: Status, detail: string) => {
    setChecks(prev => prev.map(c => (c.id === id ? { ...c, status, detail } : c)));
  };

  async function run() {
    setRunning(true);

    // 1. UA
    setCheck('ua', 'pass', navigator.userAgent);

    // 2. iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setCheck('ios', isIOS ? 'warn' : 'pass', isIOS ? 'iOS detected — full-page redirect path will be used' : 'Not iOS');

    // 3. Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setCheck('safari', isSafari ? 'warn' : 'pass', isSafari ? 'Safari detected — popups likely blocked' : 'Not Safari');

    // 4. Popup test
    try {
      const w = window.open('', '_blank', 'width=200,height=200');
      if (!w || w.closed || typeof w.closed === 'undefined') {
        setCheck('popup', 'fail', 'Popup blocked (expected on iOS Safari)');
      } else {
        w.close();
        setCheck('popup', 'pass', 'Popups allowed');
      }
    } catch (e: any) {
      setCheck('popup', 'fail', e?.message || 'Popup threw an error');
    }

    // 5. Supabase session
    try {
      const { error } = await supabase.auth.getSession();
      if (error) setCheck('session', 'fail', error.message);
      else setCheck('session', 'pass', 'Supabase reachable');
    } catch (e: any) {
      setCheck('session', 'fail', e?.message || 'Network error');
    }

    // 6. OAuth URL generation
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true,
        },
      });
      if (error) setCheck('oauth', 'fail', error.message);
      else if (data?.url) setCheck('oauth', 'pass', `OK — ${new URL(data.url).host}`);
      else setCheck('oauth', 'fail', 'No URL returned');
    } catch (e: any) {
      setCheck('oauth', 'fail', e?.message || 'Failed');
    }

    // 7. localStorage
    try {
      const k = '__ol_diag__';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      setCheck('storage', 'pass', 'localStorage writable');
    } catch (e: any) {
      setCheck('storage', 'fail', e?.message || 'Not available');
    }

    setRunning(false);
  }

  const tone: Record<Status, string> = {
    pending: 'text-muted-foreground border-border bg-muted/20',
    pass: 'text-bullish border-bullish/30 bg-bullish/5',
    fail: 'text-bearish border-bearish/30 bg-bearish/5',
    warn: 'text-[hsl(38_92%_62%)] border-[hsl(38_92%_52%/0.35)] bg-[hsl(38_92%_52%/0.08)]',
  };

  const Icon = ({ s }: { s: Status }) => {
    if (s === 'pass') return <CheckCircle2 className="h-4 w-4" />;
    if (s === 'fail') return <XCircle className="h-4 w-4" />;
    if (s === 'warn') return <AlertTriangle className="h-4 w-4" />;
    return <Loader2 className="h-4 w-4 animate-spin" />;
  };

  return (
    <div className="min-h-[100dvh] bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to="/auth" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Sign-in Diagnostic</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Runs 7 checks against this browser to debug OAuth issues. Share results with support.
          </p>
        </div>

        <div className="space-y-2">
          {checks.map(c => (
            <div key={c.id} className={cn('rounded-lg border p-3 flex items-start gap-3', tone[c.status])}>
              <div className="flex-shrink-0 mt-0.5">
                <Icon s={c.status} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest font-semibold">
                    {c.status === 'pending' ? '…' : c.status.toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-foreground">{c.label}</span>
                </div>
                {c.detail && (
                  <p className="mt-1 text-xs font-mono text-muted-foreground break-all">{c.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={run}
          disabled={running}
          className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm h-10 px-5 disabled:opacity-50"
        >
          {running ? <><Loader2 className="h-4 w-4 animate-spin" /> Running…</> : 'Re-run checks'}
        </button>
      </div>
    </div>
  );
}