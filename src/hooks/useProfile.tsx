import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProfileData {
  id: string;
  user_id: string;
  full_name: string | null;
  date_of_birth: string | null;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  timezone: string;
  locale: string;
  language: string;
  social_handles: Record<string, string>;
  account_status: string;
  contact_preferences: { email: boolean; push: boolean };
  consent_gdpr: boolean;
  consent_privacy_version: number;
  consent_terms_version: number;
  consent_accepted_at: string | null;
  onboarding_completed: boolean;
  subscription_plan: string | null;
  subscription_tier: string;
  created_at: string;
  updated_at: string;
  profile_updated_at: string | null;
}

export interface ProfileUpdateData {
  full_name?: string;
  date_of_birth?: string;
  display_name?: string;
  username?: string;
  avatar_url?: string;
  timezone?: string;
  locale?: string;
  language?: string;
  social_handles?: Record<string, string>;
  contact_preferences?: { email: boolean; push: boolean };
  consent_gdpr?: boolean;
  consent_privacy_version?: number;
  consent_terms_version?: number;
  consent_accepted_at?: string;
  onboarding_completed?: boolean;
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Type assertion since we know the structure
      setProfile(data as unknown as ProfileData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (
    updates: ProfileUpdateData,
    logChanges = true
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to update your profile');
        return false;
      }

      // Log changes to audit log if enabled
      if (logChanges && profile) {
        const auditEntries = Object.entries(updates)
          .filter(([key, value]) => {
            const oldValue = profile[key as keyof ProfileData];
            return JSON.stringify(oldValue) !== JSON.stringify(value);
          })
          .map(([key, value]) => ({
            user_id: user.id,
            field_name: key,
            old_value: JSON.stringify(profile[key as keyof ProfileData]),
            new_value: JSON.stringify(value),
            change_source: 'user'
          }));

        if (auditEntries.length > 0) {
          await supabase
            .from('profile_audit_log')
            .insert(auditEntries);
        }
      }

      // Update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Refresh profile data
      await fetchProfile();
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    }
  }, [profile, fetchProfile]);

  const updateField = useCallback(async (
    field: keyof ProfileUpdateData,
    value: ProfileUpdateData[keyof ProfileUpdateData]
  ): Promise<boolean> => {
    return updateProfile({ [field]: value });
  }, [updateProfile]);

  const checkUsernameAvailable = useCallback(async (username: string): Promise<boolean> => {
    if (!username || username.length < 3) return false;

    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .neq('user_id', user?.id || '')
      .maybeSingle();

    if (error) {
      console.error('Error checking username:', error);
      return false;
    }

    return data === null;
  }, []);

  const acceptConsent = useCallback(async (
    gdpr: boolean,
    privacyVersion: number,
    termsVersion: number
  ): Promise<boolean> => {
    return updateProfile({
      consent_gdpr: gdpr,
      consent_privacy_version: privacyVersion,
      consent_terms_version: termsVersion,
      consent_accepted_at: new Date().toISOString()
    });
  }, [updateProfile]);

  useEffect(() => {
    fetchProfile();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN') {
          fetchProfile();
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updateField,
    checkUsernameAvailable,
    acceptConsent
  };
}
