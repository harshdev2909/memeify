import { useEffect } from 'react';
import { useNotificationStore } from '../lib/store';
import { X } from 'lucide-react';

function Notifications() {
  const { notifications, removeNotification } = useNotificationStore();

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    notifications.forEach((notification) => {
      const timeout = setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
      
      timeouts.push(timeout);
    });
    
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [notifications, removeNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 w-80 max-w-full">
      {notifications.map((notification) => {
        const bgColor = 
          notification.type === 'success' ? 'bg-success/15' : 
          notification.type === 'error' ? 'bg-error/15' : 
          'bg-slate-500/15';
          
        const borderColor = 
          notification.type === 'success' ? 'border-success' : 
          notification.type === 'error' ? 'border-error' : 
          'border-slate-500';
        
        return (
          <div
            key={notification.id}
            className={`${bgColor} ${borderColor} border-l-4 p-4 rounded-r-lg shadow-md 
              backdrop-blur-sm animate-slide-up flex justify-between items-start`}
          >
            <p className="text-sm">{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default Notifications;