import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './useAuth';

type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  joined_at: string;
};

export function useProfile(userId?: string) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const profileId = userId || user?.id;

  useEffect(() => {
    if (!profileId) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error: queryError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .maybeSingle();

        if (queryError) throw queryError;
        
        // Handle case where no profile is found
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user?.id) throw new Error('No user logged in');
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (err) {
      console.error('Error updating profile:', err);
      return { error: err };
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      if (!user?.id) throw new Error('No user logged in');
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      setProfile(prev => prev ? { ...prev, avatar_url: data.publicUrl } : null);
      return { error: null, url: data.publicUrl };
    } catch (err) {
      console.error('Error uploading avatar:', err);
      return { error: err, url: null };
    }
  };

  return { profile, isLoading, error, updateProfile, uploadAvatar };
}