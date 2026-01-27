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
    if (!canAnalyze) {
      setShowPaywall(true);
      return;
    }

    await incrementUsage();
    await submitTrade(input);
  };

  const handleSaveDecision = async () => {
    toast.success('Decision saved to your history');
    // The analysis is already saved by useTrade hook
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
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
      <header className="border-b border-border">
        <div className="section-container py-4 flex items-center justify-between">
          <Link to="/">
            <BrandLogo size="md" />
          </Link>
          
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
            <Button size="sm" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="section-container py-8 sm:py-12">
        {/* Anchor text */}
        <p className="text-xs text-muted-foreground text-center mb-8">
          Risk analysis before you deploy capital
        </p>

        {/* Hero question */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-center text-foreground mb-10 max-w-md mx-auto leading-tight">
          What's the worst-case loss if I do this trade?
        </h1>

        {/* Content area */}
        <div className="max-w-md mx-auto">
          {!user ? (
            <div className="glass-card p-8 text-center">
              <p className="text-muted-foreground mb-4">
                Sign in to analyze your trades
              </p>
              <Button asChild>
                <Link to="/auth">Get started</Link>
              </Button>
            </div>
          ) : tradeLoading ? (
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
              <p className="text-sm text-muted-foreground mb-6">
                Describe the trade you're considering
              </p>
              <DecisionInput 
                onSubmit={handleSubmitTrade}
                isLoading={tradeLoading}
              />
            </div>
          )}
        </div>
      </main>

      {/* Micro disclaimer */}
      <footer className="section-container py-6">
        <p className="text-xs text-muted-foreground/60 text-center">
          Probabilistic analysis. Not financial advice. <Link to="/legal" className="hover:text-foreground">Legal</Link>
        </p>
      </footer>

      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} trigger="usage_limit" />
    </div>
  );
}
