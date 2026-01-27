import { User, Calendar, AtSign, Globe, FileText, Camera } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EditableField } from './EditableField';
import { ProfileData, ProfileUpdateData } from '@/hooks/useProfile';
import { differenceInYears, format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AvatarUpload } from '@/components/onboarding/AvatarUpload';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
interface ProfileSectionProps {
  profile: ProfileData;
  onUpdate: (updates: ProfileUpdateData) => Promise<boolean>;
  checkUsernameAvailable: (username: string) => Promise<boolean>;
}

export function ProfileSection({ 
  profile, 
  onUpdate,
  checkUsernameAvailable 
}: ProfileSectionProps) {
  const [bio, setBio] = useState(profile.bio || '');
  const [bioSaving, setBioSaving] = useState(false);
  const [bioChanged, setBioChanged] = useState(false);

  const handleBioChange = (value: string) => {
    setBio(value.slice(0, 500));
    setBioChanged(value !== (profile.bio || ''));
  };

  const handleBioSave = async () => {
    setBioSaving(true);
    await onUpdate({ bio: bio.trim() || null });
    setBioSaving(false);
    setBioChanged(false);
  };
  
  const validateName = (value: string): string | null => {
    if (!value.trim()) return 'Name is required';
    if (value.length < 2) return 'Name must be at least 2 characters';
    if (value.length > 100) return 'Name must be less than 100 characters';
    return null;
  };

  const validateDateOfBirth = (value: string): string | null => {
    if (!value) return 'Date of birth is required';
    
    try {
      const date = new Date(value);
      const age = differenceInYears(new Date(), date);
      
      if (age < 18) return 'You must be at least 18 years old';
      if (age > 120) return 'Please enter a valid date of birth';
      
      return null;
    } catch {
      return 'Please enter a valid date';
    }
  };

  const validateUsername = async (value: string): Promise<string | null> => {
    if (!value) return null; // Username is optional
    
    const trimmed = value.toLowerCase().replace(/^@/, '');
    
    if (trimmed.length < 3) return 'Username must be at least 3 characters';
    if (trimmed.length > 30) return 'Username must be less than 30 characters';
    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    
    const available = await checkUsernameAvailable(trimmed);
    if (!available) return 'This username is already taken';
    
    return null;
  };

  const formatDateForDisplay = (dateString: string | null): string | null => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const displayName = profile.display_name || profile.full_name || 'User';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleAvatarUpload = async (url: string) => {
    const success = await onUpdate({ avatar_url: url || null });
    if (success) {
      toast.success('Profile photo updated!');
    }
  };

  const handleAvatarError = (error: string) => {
    toast.error(error);
  };

  return (
    <div className="space-y-6">
      {/* Profile Photo Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Profile Photo
          </CardTitle>
          <CardDescription>
            Upload a profile photo to personalize your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Large Avatar Preview */}
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
                <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Upload Zone */}
            <div className="flex-1 w-full">
              <AvatarUpload
                userId={profile.user_id}
                currentAvatarUrl={profile.avatar_url}
                onUploadComplete={handleAvatarUpload}
                onError={handleAvatarError}
              />
              <p className="mt-3 text-xs text-muted-foreground">
                Recommended: Square image, at least 256x256px. Max 5MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Manage your personal details and display preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <EditableField
            label="Full Name"
            value={profile.full_name}
            onSave={async (value) => onUpdate({ full_name: value })}
            placeholder="Enter your full name"
            validation={validateName}
          />

          <EditableField
            label="Display Name"
            value={profile.display_name}
            onSave={async (value) => onUpdate({ display_name: value || null })}
            placeholder="How should we call you?"
            description="This is how your name appears publicly"
          />

          <EditableField
            label="Date of Birth"
            value={profile.date_of_birth}
            onSave={async (value) => onUpdate({ date_of_birth: value })}
            placeholder="Select your date of birth"
            type="date"
            validation={validateDateOfBirth}
          />

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <AtSign className="h-4 w-4 text-muted-foreground" />
              <EditableField
                label="Username"
                value={profile.username ? `@${profile.username}` : null}
                onSave={async (value) => {
                  const username = value.toLowerCase().replace(/^@/, '');
                  const error = await validateUsername(username);
                  if (error) {
                    throw new Error(error);
                  }
                  return onUpdate({ username: username || null });
                }}
                placeholder="@username"
                description="Your unique handle for the platform"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Bio</span>
          </div>
          
          <div className="space-y-2">
            <Textarea
              value={bio}
              onChange={(e) => handleBioChange(e.target.value)}
              placeholder="Tell us about yourself..."
              className="trading-input min-h-[100px] resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{bio.length}/500 characters</span>
              {bioChanged && (
                <Button size="sm" onClick={handleBioSave} disabled={bioSaving}>
                  {bioSaving ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Bio'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Regional Settings</span>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <span className="text-sm text-muted-foreground">Timezone</span>
              <p className="text-sm text-foreground">{profile.timezone}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-sm text-muted-foreground">Locale</span>
              <p className="text-sm text-foreground">{profile.locale}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-sm text-muted-foreground">Language</span>
              <p className="text-sm text-foreground">{profile.language.toUpperCase()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
