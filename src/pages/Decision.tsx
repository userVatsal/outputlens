import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTrade } from '@/hooks/useTrade';
import { useUsage } from '@/hooks/useUsage';
import { DecisionInput, DecisionResult, LoadingState } from '@/components/decision';
import { PaywallModal } from '@/components/PaywallModal';
import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';
import { LogOut, FileText, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function Decision() {
  const navigate = useNavigate();
  const { analysis, submitTrade, clearAnalysis, isLoading: tradeLoading } = useTrade();
  const { canAnalyze, incrementUsage } = useUsage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    document.title = 'OutputLens - Know Your Downside Before You Trade';
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmitTrade = async (input: Parameters<typeof submitTrade>[0]) => {
    // If not logged in, redirect to auth
    if (!user) {
      toast.info('Sign in to analyze your trade');
      navigate('/auth');
      return;
    }

    if (!canAnalyze) {
      setShowPaywall(true);
      return;
    }

    await incrementUsage();
    await submitTrade(input);
  };

  const handleSaveDecision = async () => {
    toast.success('Decision saved to your history');
  };

  const handleClose = () => {
    clearAnalysis();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header - no border */}
      <header className="py-4">
        <div className="section-container flex items-center justify-between">
          <BrandLogo size="md" />
          
          {user ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/decisions" className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Decisions</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/account" className="flex items-center gap-1.5">
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Account</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      {/* Main content - centered vertically */}
      <main className="flex-1 flex flex-col justify-center section-container py-8">
        {/* Hero headline */}
        <h1 className="text-3xl sm:text-4xl font-semibold text-center text-foreground mb-3 max-w-lg mx-auto leading-tight">
          Know your downside before you trade.
        </h1>
        
        {/* Subhead */}
        <p className="text-base text-muted-foreground text-center mb-10">
          Enter your trade details to see the worst-case loss.
        </p>

        {/* Decision interface */}
        <div className="max-w-md mx-auto w-full">
          {tradeLoading ? (
            <div className="glass-card p-8">
              <LoadingState />
            </div>
          ) : analysis ? (
            <div className="glass-card p-6">
              <DecisionResult 
                analysis={analysis}
                onSave={handleSaveDecision}
                onClose={handleClose}
              />
            </div>
          ) : (
            <div className="glass-card p-6">
              <DecisionInput 
                onSubmit={handleSubmitTrade}
                isLoading={tradeLoading}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6">
        <p className="text-xs text-muted-foreground/60 text-center">
          Probabilistic analysis. Not financial advice.{' '}
          <Link to="/legal" className="hover:text-foreground transition-colors">Legal</Link>
          {!user && (
            <>
              {' · '}
              <Link to="/auth" className="hover:text-foreground transition-colors">Sign in</Link>
            </>
          )}
        </p>
      </footer>

      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} trigger="usage_limit" />
    </div>
  );
}
