import { useState, useEffect, useCallback } from 'react';
import { User, AtSign, Calendar, AlertCircle, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { differenceInYears } from 'date-fns';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  username: z.string()
    .min(3, 'Handle must be at least 3 characters')
    .max(30, 'Handle must be less than 30 characters')
    .regex(/^[a-z][a-z0-9_]*$/, 'Handle must start with a letter and contain only lowercase letters, numbers, and underscores'),
  dateOfBirth: z.string().refine((val) => {
    if (!val) return false;
    const date = new Date(val);
    const age = differenceInYears(new Date(), date);
    return age >= 18;
  }, 'You must be at least 18 years old'),
});

interface StepProfileProps {
  userId: string;
  onComplete: (name: string) => void;
  onBack: () => void;
}

export function StepProfile({ userId, onComplete, onBack }: StepProfileProps) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Handle validation state
  const [checkingHandle, setCheckingHandle] = useState(false);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [handleError, setHandleError] = useState<string | null>(null);

  // Debounced handle check
  const checkHandleAvailability = useCallback(async (handle: string) => {
    if (!handle || handle.length < 3) {
      setHandleAvailable(null);
      setHandleError(null);
      return;
    }

    // Validate format first
    if (!/^[a-z][a-z0-9_]*$/.test(handle)) {
      setHandleAvailable(false);
      setHandleError('Handle must start with a letter and contain only lowercase letters, numbers, and underscores');
      return;
    }

    setCheckingHandle(true);
    setHandleError(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', handle.toLowerCase())
        .neq('user_id', userId)
        .maybeSingle();

      if (error) {
        setHandleError('Error checking handle availability');
        setHandleAvailable(null);
      } else if (data) {
        setHandleAvailable(false);
        setHandleError('This handle is already taken');
      } else {
        setHandleAvailable(true);
        setHandleError(null);
      }
    } catch (err) {
      setHandleError('Error checking handle availability');
      setHandleAvailable(null);
    } finally {
      setCheckingHandle(false);
    }
  }, [userId]);

  // Debounce handle check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) {
        checkHandleAvailability(username.toLowerCase().replace(/^@/, ''));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, checkHandleAvailability]);

  const handleUsernameChange = (value: string) => {
    // Remove @ if user types it, force lowercase
    const cleaned = value.toLowerCase().replace(/^@/, '');
    setUsername(cleaned);
    setHandleAvailable(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    try {
      profileSchema.parse({ 
        fullName, 
        username: username.toLowerCase(), 
        dateOfBirth 
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return;
    }

    // Check handle availability
    if (!handleAvailable) {
      setError('Please choose an available handle');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username: username.toLowerCase(),
          date_of_birth: dateOfBirth,
          display_name: fullName.split(' ')[0], // First name as display name
        })
        .eq('user_id', userId);

      if (updateError) {
        if (updateError.message.includes('duplicate')) {
          setError('This handle is already taken. Please choose another.');
        } else {
          setError(updateError.message);
        }
        return;
      }

      onComplete(fullName);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate max date for DOB (must be 18+)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);
  const maxDateString = maxDate.toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName" className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          Full Name
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="trading-input"
          disabled={loading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username" className="flex items-center gap-2">
          <AtSign className="h-4 w-4 text-muted-foreground" />
          Handle
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
            @
          </div>
          <Input
            id="username"
            type="text"
            placeholder="johndoe"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            className="trading-input pl-8 pr-10"
            disabled={loading}
            required
          />
          <div className="absolute inset-y-0 right-3 flex items-center">
            {checkingHandle && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {!checkingHandle && handleAvailable === true && <Check className="h-4 w-4 text-green-500" />}
            {!checkingHandle && handleAvailable === false && <X className="h-4 w-4 text-destructive" />}
          </div>
        </div>
        {handleError && (
          <p className="text-xs text-destructive">{handleError}</p>
        )}
        {handleAvailable && (
          <p className="text-xs text-green-500">Handle is available!</p>
        )}
        <p className="text-xs text-muted-foreground">
          Lowercase letters, numbers, and underscores only. Must start with a letter.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Date of Birth
        </Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          max={maxDateString}
          className="trading-input"
          disabled={loading}
          required
        />
        <p className="text-xs text-muted-foreground">You must be at least 18 years old</p>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button type="submit" className="flex-1" disabled={loading || handleAvailable === false}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </form>
  );
}
