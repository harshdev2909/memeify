import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './useAuth';
import confetti from 'canvas-confetti';

export type Meme = {
  id: string;
  title: string;
  image_url: string;
  tags: string[];
  creator_id: string;
  created_at: string;
  likes_count: number;
  creator?: {
    username: string;
    avatar_url: string | null;
  };
  isLiked?: boolean;
};

export function useMemes(creatorId?: string, tag?: string) {
  const { user } = useAuth();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMemes = async () => {
      try {
        setIsLoading(true);
        
        // Build query
        let query = supabase
          .from('memes')
          .select(`
            *,
            creator:profiles(username, avatar_url)
          `)
          .order('created_at', { ascending: false });
        
        // Apply filters if provided
        if (creatorId) {
          query = query.eq('creator_id', creatorId);
        }
        
        if (tag) {
          query = query.contains('tags', [tag]);
        }
        
        const { data, error: fetchError } = await query;
        
        if (fetchError) throw fetchError;
        
        // Fetch user likes if authenticated
        let likedMemeIds: string[] = [];
        if (user) {
          const { data: likesData } = await supabase
            .from('likes')
            .select('meme_id')
            .eq('user_id', user.id);
          
          likedMemeIds = likesData?.map(like => like.meme_id) || [];
        }
        
        // Add isLiked property to memes
        const memesWithLikes = data?.map(meme => ({
          ...meme,
          isLiked: likedMemeIds.includes(meme.id)
        })) || [];
        
        setMemes(memesWithLikes);
      } catch (err) {
        console.error('Error fetching memes:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch memes'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemes();

    // Set up realtime subscription
    const subscription = supabase
      .channel('public:memes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'memes' 
      }, fetchMemes)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, creatorId, tag]);

  const toggleLike = async (memeId: string) => {
    try {
      if (!user) throw new Error('You must be logged in to like memes');
      
      const meme = memes.find(m => m.id === memeId);
      if (!meme) throw new Error('Meme not found');
      
      const isCurrentlyLiked = meme.isLiked;
      
      // Optimistically update UI
      setMemes(prev => 
        prev.map(m => 
          m.id === memeId 
            ? { 
                ...m, 
                isLiked: !isCurrentlyLiked, 
                likes_count: isCurrentlyLiked ? m.likes_count - 1 : m.likes_count + 1
              } 
            : m
        )
      );
      
      if (isCurrentlyLiked) {
        // Remove like
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('meme_id', memeId);
      } else {
        // Add like
        await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            meme_id: memeId
          });
        
        // Update likes count in memes table
        await supabase
          .from('memes')
          .update({ 
            likes_count: meme.likes_count + 1 
          })
          .eq('id', memeId);
          
        // Trigger confetti animation
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      return { error: null };
    } catch (err) {
      console.error('Error toggling like:', err);
      
      // Revert optimistic update
      setMemes(prev => [...prev]);
      
      return { error: err };
    }
  };

  const createMeme = async (memeData: {
    title: string;
    imageFile: File;
    tags: string[];
  }) => {
    try {
      if (!user) throw new Error('You must be logged in to create memes');
      
      const { title, imageFile, tags } = memeData;
      
      // Upload image to storage
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('memes')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('memes')
        .getPublicUrl(filePath);
      
      // Insert meme record
      const { data, error: insertError } = await supabase
        .from('memes')
        .insert({
          title,
          image_url: urlData.publicUrl,
          tags,
          creator_id: user.id,
          likes_count: 0
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      // Trigger confetti animation
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });
      
      return { data, error: null };
    } catch (err) {
      console.error('Error creating meme:', err);
      return { data: null, error: err };
    }
  };

  return { memes, isLoading, error, toggleLike, createMeme };
}