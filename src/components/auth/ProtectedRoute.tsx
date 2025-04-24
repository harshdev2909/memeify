import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/hooks/useAuth';
import { useModalStore } from '../../lib/store';

type ProtectedRouteProps = {
  children: ReactNode;
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { openAuthModal } = useModalStore();
  
  // If we're still loading, show a loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If no user is logged in, open auth modal and redirect to home
  if (!user) {
    openAuthModal();
    return <Navigate to="/" replace />;
  }
  
  // If user is logged in, render the children
  return <>{children}</>;
}

export default ProtectedRoute;