import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Edit, X, Upload, Calendar, Award } from 'lucide-react';
import Masonry from 'react-masonry-css';
import MemeCard from '../components/MemeCard';
import { useAuth } from '../lib/hooks/useAuth';
import { useProfile } from '../lib/hooks/useProfile';
import { useMemes } from '../lib/hooks/useMemes';
import { useNotificationStore } from '../lib/store';
import { formatRelativeTime } from '../lib/utils';

function Profile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const { profile, isLoading: isProfileLoading, updateProfile, uploadAvatar } = useProfile(userId);
  const { memes, isLoading: isMemesLoading, toggleLike } = useMemes(userId || user?.id);
  const { addNotification } = useNotificationStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const isOwnProfile = !userId || userId === user?.id;
  const totalLikes = memes.reduce((acc, meme) => acc + meme.likes_count, 0);
  const isMemesMaster = totalLikes >= 10;
  
  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
    }
  }, [profile]);
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    
    // Reset form when canceling edit
    if (isEditing) {
      setUsername(profile?.username || '');
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOwnProfile) return;
    
    try {
      if (username !== profile?.username) {
        await updateProfile({ username });
      }
      
      if (avatarFile) {
        await uploadAvatar(avatarFile);
      }
      
      setIsEditing(false);
      addNotification('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      addNotification(
        error instanceof Error 
          ? error.message 
          : 'Failed to update profile. Please try again.',
        'error'
      );
    }
  };
  
  const handleLike = async (memeId: string) => {
    const { error } = await toggleLike(memeId);
    
    if (error) {
      addNotification(
        error instanceof Error 
          ? error.message 
          : 'Failed to like meme. Please try again.',
        'error'
      );
      return { error };
    }
    
    return { error: null };
  };
  
  // Breakpoints for masonry grid
  const breakpointColumns = {
    default: 3,
    1024: 2,
    640: 1,
  };
  
  if (isProfileLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl font-bold mb-2">Profile not found</p>
        <p className="text-slate-500 dark:text-slate-400">
          The user you're looking for doesn't exist or has been removed
        </p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Profile header */}
      <section className="mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 to-secondary/20 h-32"></div>
          
          <div className="p-6 -mt-16">
            <div className="flex flex-col md:flex-row md:items-end">
              {/* Avatar */}
              <div className="relative">
                {isEditing ? (
                  <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="h-full w-full object-cover"
                      />
                    ) : profile.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.username} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary text-white text-2xl font-bold">
                        {profile.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    <label 
                      htmlFor="avatar-upload" 
                      className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <Upload className="h-8 w-8 text-white" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800">
                    {profile.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.username} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary text-white text-2xl font-bold">
                        {profile.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Badge for Meme Master */}
                {isMemesMaster && (
                  <div className="absolute -right-2 -bottom-2 bg-accent text-foreground rounded-full p-1 shadow-lg" title="Meme Master">
                    <Award className="h-5 w-5" />
                  </div>
                )}
              </div>
              
              <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium mb-1">
                        Username
                      </label>
                      <input
                        id="username"
                        type="text"
                        className="input w-full max-w-xs"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        minLength={3}
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={handleEditToggle}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-bold flex items-center">
                        {profile.username}
                        {isMemesMaster && (
                          <span className="ml-2 text-xs bg-accent text-foreground rounded-full px-2 py-0.5 flex items-center">
                            <Award className="h-3 w-3 mr-1" />
                            Meme Master
                          </span>
                        )}
                      </h1>
                      
                      <div className="flex items-center mt-1 text-sm text-slate-500 dark:text-slate-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        Joined {formatRelativeTime(profile.joined_at)}
                      </div>
                      
                      <div className="flex space-x-4 mt-2">
                        <div>
                          <span className="font-bold">{memes.length}</span>
                          <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">
                            {memes.length === 1 ? 'Meme' : 'Memes'}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold">{totalLikes}</span>
                          <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">
                            {totalLikes === 1 ? 'Like' : 'Likes'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {isOwnProfile && (
                      <button
                        onClick={handleEditToggle}
                        className="btn btn-ghost"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Memes section */}
      <section>
        <h2 className="text-xl font-bold mb-4">
          {isOwnProfile ? 'Your Memes' : `${profile.username}'s Memes`}
        </h2>
        
        {isMemesLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : memes.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <p className="font-bold mb-2">No memes yet</p>
            <p className="text-slate-500 dark:text-slate-400">
              {isOwnProfile 
                ? 'You haven\'t created any memes yet'
                : `${profile.username} hasn't created any memes yet`}
            </p>
          </div>
        ) : (
          <Masonry
            breakpointCols={breakpointColumns}
            className="flex -ml-4 w-auto"
            columnClassName="pl-4 bg-clip-padding"
          >
            {memes.map((meme) => (
              <div 
                key={meme.id} 
                className="mb-4"
              >
                <MemeCard 
                  meme={meme} 
                  onLike={handleLike}
                />
              </div>
            ))}
          </Masonry>
        )}
      </section>
    </div>
  );
}

export default Profile;