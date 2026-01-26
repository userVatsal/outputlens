import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { AvatarUpload } from './AvatarUpload';

interface StepCompleteProps {
  userId: string;
  onComplete: () => void;
  onBack: () => void;
}

export function StepComplete({ userId, onComplete, onBack }: StepCompleteProps) {
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const updates: Record<string, unknown> = {
        onboarding_completed: true,
      };

      if (bio.trim()) {
        updates.bio = bio.trim();
      }

      if (avatarUrl) {
        updates.avatar_url = avatarUrl;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      onComplete();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', userId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      onComplete();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label>Profile Picture</Label>
        <AvatarUpload
          userId={userId}
          currentAvatarUrl={avatarUrl}
          onUploadComplete={setAvatarUrl}
          onError={setError}
        />
        <p className="text-xs text-muted-foreground">
          Optional. Max 5MB. PNG, JPG, or WebP.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell us a bit about yourself... (optional)"
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 500))}
          className="trading-input min-h-[100px] resize-none"
          disabled={loading}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Optional. Visible to other community members in the future.</span>
          <span>{bio.length}/500</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          onClick={handleSkip} 
          disabled={loading}
          className="text-muted-foreground"
        >
          Skip for now
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Completing...
            </>
          ) : (
            'Complete Profile'
          )}
        </Button>
      </div>
    </form>
  );
}
