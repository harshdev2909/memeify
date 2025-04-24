import { useCallback, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        
        // Check if profile exists for the user
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          // If no profile exists, create one
          if (!profile) {
            const username = session.user.user_metadata.username;
            await supabase.from('profiles').insert({
              id: session.user.id,
              username: username || session.user.email?.split('@')[0],
              joined_at: new Date().toISOString(),
            });
          }
        }
        
        setIsLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async ({ email, password }: { email: string; password: string }) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  }, []);

  const signUp = useCallback(async ({ email, password, username }: { email: string; password: string; username: string }) => {
    try {
      // Start a transaction using the REST API
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { username }
        }
      });
      
      if (signUpError) throw signUpError;
      
      if (!user) {
        throw new Error('User creation failed');
      }

      // Create profile immediately after user creation
      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        username,
        joined_at: new Date().toISOString(),
      });

      if (profileError) {
        // If profile creation fails, we should clean up the user
        await supabase.auth.signOut();
        throw profileError;
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error };
    }
  }, []);

  const signInWithGithub = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
      return { error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  }, [navigate]);

  return { session, user, signIn, signUp, signInWithGithub, signOut, isLoading };
}