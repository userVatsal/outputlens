import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const completed = localStorage.getItem('ol_onboarding_complete');
        navigate(completed ? '/dashboard' : '/onboarding', { replace: true });
      } else {
        navigate('/auth', { replace: true });
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-mono">
          Completing sign in...
        </p>
      </div>
    </div>
  );
}