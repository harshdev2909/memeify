import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useModalStore } from '../../lib/store';
import { useComments } from '../../lib/hooks/useComments';
import { useAuth } from '../../lib/hooks/useAuth';
import { formatRelativeTime } from '../../lib/utils';

type CommentsModalProps = {
  memeId: string;
};

function CommentsModal({ memeId }: CommentsModalProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { closeCommentsModal } = useModalStore();
  const { comments, isLoading, addComment, deleteComment } = useComments(memeId);
  const { user } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await addComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={closeCommentsModal}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold">Comments</h2>
          <button
            onClick={closeCommentsModal}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <p>No comments yet</p>
              <p className="text-sm mt-1">Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div 
                key={comment.id} 
                className="flex space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex-shrink-0">
                  {comment.user?.avatar_url ? (
                    <img 
                      src={comment.user.avatar_url} 
                      alt={comment.user.username} 
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                      {comment.user?.username.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-medium">
                      {comment.user?.username || 'User'}
                    </p>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatRelativeTime(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm mt-1 break-words">{comment.content}</p>
                  
                  {user?.id === comment.user_id && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-error hover:underline mt-1"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {user ? (
          <form 
            onSubmit={handleSubmit}
            className="border-t border-slate-200 dark:border-slate-700 p-4"
          >
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add a comment..."
                className="input flex-1"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!newComment.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="border-t border-slate-200 dark:border-slate-700 p-4 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sign in to add a comment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentsModal;