import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useNotificationStore } from '../../lib/store';

function AuthCallback() {
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Process the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        // Check if this is a new user (needs profile creation)
        if (data.session?.user) {
          const userId = data.session.user.id;
          
          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }
          
          // If no profile, create one
          if (!profile) {
            const username = data.session.user.email?.split('@')[0] || 'user';
            
            await supabase.from('profiles').insert({
              id: userId,
              username,
              joined_at: new Date().toISOString(),
            });
            
            addNotification('Welcome to MemeGen!', 'success');
          } else {
            addNotification('Successfully signed in!', 'success');
          }
        }
        
        // Redirect to the home page
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Error in auth callback:', error);
        addNotification('Authentication failed. Please try again.', 'error');
        navigate('/', { replace: true });
      }
    };
    
    handleAuthCallback();
  }, [navigate, addNotification]);
  
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-lg font-medium">Finishing authentication...</p>
      </div>
    </div>
  );
}

export default AuthCallback;