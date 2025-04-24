import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessagesSquare, Tag, HeartOff } from 'lucide-react';
import { Meme } from '../lib/hooks/useMemes';
import { useModalStore } from '../lib/store';
import { useAuth } from '../lib/hooks/useAuth';
import { formatRelativeTime } from '../lib/utils';

type MemeCardProps = {
  meme: Meme;
  onLike: (memeId: string) => Promise<{ error: Error | null }>;
  className?: string;
};

function MemeCard({ meme, onLike, className = '' }: MemeCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { openCommentsModal, openAuthModal } = useModalStore();
  const { user } = useAuth();
  
  const handleLikeClick = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    
    await onLike(meme.id);
  };
  
  const handleCommentClick = () => {
    openCommentsModal(meme.id);
  };
  
  return (
    <div 
      className={`card overflow-hidden h-full transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image wrapper */}
      <div className="relative overflow-hidden">
        {/* Loading skeleton */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse" />
        )}
        
        {/* Meme image */}
        <img
          src={meme.image_url}
          alt={meme.title}
          className={`w-full h-auto object-cover transition-transform duration-500 ${
            isHovered ? 'scale-105' : 'scale-100'
          } ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsImageLoaded(true)}
        />
        
        {/* Hover overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent
            flex items-end transition-opacity duration-300 p-4 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="text-white">
            <h3 className="text-lg font-bold truncate">{meme.title}</h3>
            
            {/* Tags */}
            {meme.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {meme.tags.slice(0, 3).map((tag) => (
                  <Link
                    key={tag}
                    to={`/?search=${encodeURIComponent(tag)}`}
                    className="flex items-center text-xs bg-white/20 rounded-full px-2 py-0.5 hover:bg-white/30 transition-colors"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Link>
                ))}
                {meme.tags.length > 3 && (
                  <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">
                    +{meme.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Card footer */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          {/* Creator info */}
          <Link 
            to={`/profile/${meme.creator_id}`}
            className="flex items-center"
          >
            {meme.creator?.avatar_url ? (
              <img 
                src={meme.creator.avatar_url} 
                alt={meme.creator.username} 
                className="h-6 w-6 rounded-full object-cover mr-2"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white text-xs mr-2">
                {meme.creator?.username.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <span className="text-sm font-medium truncate max-w-[100px]">
              {meme.creator?.username || 'User'}
            </span>
          </Link>
          
          {/* Post date */}
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatRelativeTime(meme.created_at)}
          </span>
        </div>
        
        {/* Title */}
        <h3 className="font-medium mb-2 truncate">{meme.title}</h3>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLikeClick}
            className={`flex items-center transition-colors ${
              meme.isLiked 
                ? 'text-error' 
                : 'text-slate-600 dark:text-slate-400 hover:text-error dark:hover:text-error'
            }`}
            aria-label={meme.isLiked ? 'Unlike' : 'Like'}
          >
            {meme.isLiked ? (
              <Heart className="h-5 w-5 fill-error" />
            ) : (
              <Heart className="h-5 w-5" />
            )}
            <span className="ml-1">{meme.likes_count}</span>
          </button>
          
          <button
            onClick={handleCommentClick}
            className="flex items-center text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
            aria-label="View comments"
          >
            <MessagesSquare className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MemeCard;