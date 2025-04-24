import { useState } from 'react';
import { X, Github } from 'lucide-react';
import { useAuth } from '../../lib/hooks/useAuth';
import { useModalStore } from '../../lib/store';
import { useNotificationStore } from '../../lib/store';
import { useForm } from 'react-hook-form';

type FormValues = {
  email: string;
  password: string;
  username?: string;
};

function AuthModal() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, signInWithGithub } = useAuth();
  const { closeAuthModal } = useModalStore();
  const { addNotification } = useNotificationStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      if (mode === 'signin') {
        const { error } = await signIn({ 
          email: data.email, 
          password: data.password 
        });
        
        if (error) throw error;
        
        addNotification('Successfully signed in!', 'success');
        closeAuthModal();
      } else {
        if (!data.username) {
          throw new Error('Username is required');
        }
        
        const { error } = await signUp({ 
          email: data.email, 
          password: data.password,
          username: data.username
        });
        
        if (error) throw error;
        
        addNotification('Account created successfully!', 'success');
        closeAuthModal();
      }
    } catch (error) {
      console.error('Auth error:', error);
      addNotification(
        error instanceof Error 
          ? error.message 
          : 'Authentication failed. Please try again.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGithubSignIn = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await signInWithGithub();
      
      if (error) throw error;
      
      closeAuthModal();
    } catch (error) {
      console.error('GitHub auth error:', error);
      addNotification(
        'GitHub authentication failed. Please try again.',
        'error'
      );
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={closeAuthModal}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="input w-full"
                {...register('username', { 
                  required: mode === 'signup' ? 'Username is required' : false,
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters'
                  }
                })}
                disabled={isLoading}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-error">{errors.username.message}</p>
              )}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input w-full"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-error">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input w-full"
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-error">{errors.password.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : (
              mode === 'signin' ? 'Sign In' : 'Sign Up'
            )}
          </button>
        </form>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-slate-900 px-2 text-sm text-slate-500 dark:text-slate-400">Or continue with</span>
          </div>
        </div>
        
        <button
          onClick={handleGithubSignIn}
          className="flex items-center justify-center w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          disabled={isLoading}
        >
          <Github className="h-5 w-5 mr-2" />
          <span>GitHub</span>
        </button>
        
        <div className="mt-6 text-center text-sm">
          {mode === 'signin' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-primary hover:underline font-medium"
                disabled={isLoading}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setMode('signin')}
                className="text-primary hover:underline font-medium"
                disabled={isLoading}
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;