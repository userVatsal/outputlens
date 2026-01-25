import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://outputlens.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation helpers
const validateFullName = (name: string): string | null => {
  if (!name || name.trim().length < 2) return 'Name must be at least 2 characters';
  if (name.length > 100) return 'Name must be less than 100 characters';
  // Basic XSS prevention
  if (/<[^>]*>/.test(name)) return 'Invalid characters in name';
  return null;
};

const validateDateOfBirth = (dob: string): string | null => {
  if (!dob) return 'Date of birth is required';
  
  const date = new Date(dob);
  if (isNaN(date.getTime())) return 'Invalid date format';
  
  const now = new Date();
  const age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  const actualAge = monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate()) 
    ? age - 1 
    : age;
  
  if (actualAge < 18) return 'You must be at least 18 years old';
  if (actualAge > 120) return 'Please enter a valid date of birth';
  
  return null;
};

const validateUsername = (username: string): string | null => {
  if (!username) return null; // Optional field
  
  const trimmed = username.toLowerCase().replace(/^@/, '');
  
  if (trimmed.length < 3) return 'Username must be at least 3 characters';
  if (trimmed.length > 30) return 'Username must be less than 30 characters';
  if (!/^[a-z0-9_]+$/.test(trimmed)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  
  return null;
};

const validateDisplayName = (name: string): string | null => {
  if (!name) return null; // Optional field
  if (name.length > 50) return 'Display name must be less than 50 characters';
  if (/<[^>]*>/.test(name)) return 'Invalid characters in display name';
  return null;
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's auth token
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    // Create admin client for username uniqueness check
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { updates } = body;

    if (!updates || typeof updates !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validatedUpdates: Record<string, any> = {};
    const errors: Record<string, string> = {};

    // Validate each field
    if ('full_name' in updates) {
      const error = validateFullName(updates.full_name);
      if (error) errors.full_name = error;
      else validatedUpdates.full_name = updates.full_name.trim();
    }

    if ('date_of_birth' in updates) {
      const error = validateDateOfBirth(updates.date_of_birth);
      if (error) errors.date_of_birth = error;
      else validatedUpdates.date_of_birth = updates.date_of_birth;
    }

    if ('display_name' in updates) {
      const error = validateDisplayName(updates.display_name);
      if (error) errors.display_name = error;
      else validatedUpdates.display_name = updates.display_name?.trim() || null;
    }

    if ('username' in updates) {
      const username = updates.username?.toLowerCase().replace(/^@/, '') || null;
      
      if (username) {
        const error = validateUsername(username);
        if (error) {
          errors.username = error;
        } else {
          // Check uniqueness using admin client
          const { data: existing } = await adminSupabase
            .from('profiles')
            .select('username')
            .eq('username', username)
            .neq('user_id', user.id)
            .maybeSingle();

          if (existing) {
            errors.username = 'This username is already taken';
          } else {
            validatedUpdates.username = username;
          }
        }
      } else {
        validatedUpdates.username = null;
      }
    }

    // Consent fields (no validation needed, just sanitization)
    if ('consent_gdpr' in updates) {
      validatedUpdates.consent_gdpr = Boolean(updates.consent_gdpr);
    }
    if ('consent_privacy_version' in updates) {
      validatedUpdates.consent_privacy_version = parseInt(updates.consent_privacy_version) || 0;
    }
    if ('consent_terms_version' in updates) {
      validatedUpdates.consent_terms_version = parseInt(updates.consent_terms_version) || 0;
    }
    if ('consent_accepted_at' in updates) {
      validatedUpdates.consent_accepted_at = updates.consent_accepted_at;
    }

    // Preferences (with validation)
    if ('timezone' in updates) {
      validatedUpdates.timezone = updates.timezone?.substring(0, 50) || 'UTC';
    }
    if ('locale' in updates) {
      validatedUpdates.locale = updates.locale?.substring(0, 10) || 'en-US';
    }
    if ('language' in updates) {
      validatedUpdates.language = updates.language?.substring(0, 5) || 'en';
    }
    if ('contact_preferences' in updates) {
      validatedUpdates.contact_preferences = {
        email: Boolean(updates.contact_preferences?.email),
        push: Boolean(updates.contact_preferences?.push)
      };
    }

    // Return validation errors if any
    if (Object.keys(errors).length > 0) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (Object.keys(validatedUpdates).length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid updates provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current profile for audit logging
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Create audit log entries
    const auditEntries = Object.entries(validatedUpdates)
      .filter(([key, value]) => {
        const oldValue = currentProfile?.[key];
        return JSON.stringify(oldValue) !== JSON.stringify(value);
      })
      .map(([key, value]) => ({
        user_id: user.id,
        field_name: key,
        old_value: JSON.stringify(currentProfile?.[key] ?? null),
        new_value: JSON.stringify(value),
        change_source: 'user'
      }));

    if (auditEntries.length > 0) {
      const { error: auditError } = await supabase
        .from('profile_audit_log')
        .insert(auditEntries);
      
      if (auditError) {
        console.error('Audit log error:', auditError);
        // Don't fail the update for audit log errors
      }
    }

    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(validatedUpdates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Profile updated for user ${user.id}:`, Object.keys(validatedUpdates));

    return new Response(
      JSON.stringify({ 
        success: true, 
        profile: updatedProfile,
        updated_fields: Object.keys(validatedUpdates)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
