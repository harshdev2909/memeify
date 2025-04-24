import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Tag, X, Shuffle } from 'lucide-react';
import Masonry from 'react-masonry-css';
import MemeCard from '../components/MemeCard';
import { useMemes } from '../lib/hooks/useMemes';
import { useNotificationStore } from '../lib/store';

const POPULAR_TAGS = ['funny', 'reactions', 'animals', 'politics', 'movies', 'gaming'];

function Home() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const { memes, isLoading, error, toggleLike } = useMemes(undefined, activeTag);
  const { addNotification } = useNotificationStore();
  
  // Get search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    
    if (search) {
      setSearchQuery(search);
      setActiveTag(search);
    } else {
      setSearchQuery('');
      setActiveTag(null);
    }
  }, [location.search]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      setActiveTag(searchQuery.trim());
    } else {
      setActiveTag(null);
    }
  };
  
  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setActiveTag(tag);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setActiveTag(null);
  };
  
  const showRandomMeme = () => {
    if (memes.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * memes.length);
    const randomMeme = memes[randomIndex];
    
    // Scroll to the meme
    const element = document.getElementById(`meme-${randomMeme.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight the meme temporarily
      element.classList.add('ring-4', 'ring-accent', 'ring-offset-2');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-accent', 'ring-offset-2');
      }, 2000);
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
    default: 4,
    1280: 3,
    1024: 3,
    768: 2,
    640: 1,
  };
  
  return (
    <div>
      {/* Header section */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {activeTag 
            ? `Memes tagged with "${activeTag}"` 
            : 'Trending Memes'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Browse and enjoy the best memes on the internet
        </p>
      </section>
      
      {/* Search and filter section */}
      <section className="mb-8">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search form */}
          <form 
            onSubmit={handleSearch}
            className="relative flex-1 min-w-[200px]"
          >
            <input
              type="text"
              placeholder="Search memes by tag"
              className="input pr-10 w-full max-w-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute right-10 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
          
          {/* Random meme button */}
          <button
            onClick={showRandomMeme}
            className="btn btn-ghost flex-shrink-0"
            disabled={isLoading || memes.length === 0}
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Random Meme
          </button>
          
          {/* Create meme button */}
          <Link
            to="/create"
            className="btn btn-secondary flex-shrink-0"
          >
            Create Meme
          </Link>
        </div>
        
        {/* Popular tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`flex items-center text-sm rounded-full px-3 py-1 transition-colors ${
                activeTag === tag
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </button>
          ))}
        </div>
      </section>
      
      {/* Memes grid */}
      <section>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-error mb-2">Failed to load memes</p>
            <p className="text-slate-500 dark:text-slate-400">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
          </div>
        ) : memes.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <p className="text-2xl font-bold mb-2">No memes found</p>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {activeTag 
                ? `No memes tagged with "${activeTag}"`
                : 'No memes available yet'}
            </p>
            <Link to="/create" className="btn btn-primary">
              Create the first meme
            </Link>
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
                id={`meme-${meme.id}`}
                className="mb-4 transition-all"
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

export default Home;