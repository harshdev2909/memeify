import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './useAuth';

export type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  meme_id: string;
  user?: {
    username: string;
    avatar_url: string | null;
  };
};

export function useComments(memeId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        
        const { data, error: fetchError } = await supabase
          .from('comments')
          .select(`
            *,
            user:profiles(username, avatar_url)
          `)
          .eq('meme_id', memeId)
          .order('created_at', { ascending: false });
        
        if (fetchError) throw fetchError;
        
        setComments(data || []);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch comments'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();

    // Set up realtime subscription
    const subscription = supabase
      .channel(`comments:${memeId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'comments',
        filter: `meme_id=eq.${memeId}`
      }, fetchComments)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [memeId]);

  const addComment = async (content: string) => {
    try {
      if (!user) throw new Error('You must be logged in to comment');
      
      const { data, error: insertError } = await supabase
        .from('comments')
        .insert({
          content,
          meme_id: memeId,
          user_id: user.id
        })
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .single();
      
      if (insertError) throw insertError;
      
      setComments(prev => [data, ...prev]);
      return { error: null };
    } catch (err) {
      console.error('Error adding comment:', err);
      return { error: err };
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      if (!user) throw new Error('You must be logged in to delete comments');
      
      // Check if user is the comment author
      const comment = comments.find(c => c.id === commentId);
      if (!comment) throw new Error('Comment not found');
      
      if (comment.user_id !== user.id) {
        throw new Error('You can only delete your own comments');
      }
      
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      
      if (deleteError) throw deleteError;
      
      setComments(prev => prev.filter(c => c.id !== commentId));
      return { error: null };
    } catch (err) {
      console.error('Error deleting comment:', err);
      return { error: err };
    }
  };

  return { comments, isLoading, error, addComment, deleteComment };
}