import { Link } from 'react-router-dom';
import { FrownIcon, Home } from 'lucide-react';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FrownIcon className="h-24 w-24 text-slate-300 dark:text-slate-600 mb-6" />
      
      <h1 className="text-4xl font-bold mb-2">404 - Page Not Found</h1>
      
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      
      <Link to="/" className="btn btn-primary">
        <Home className="h-4 w-4 mr-2" />
        Back to Home
      </Link>
    </div>
  );
}

export default NotFound;