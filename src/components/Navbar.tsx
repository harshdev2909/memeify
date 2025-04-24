import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  PlusCircle, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Moon, 
  Sun, 
  Heart, 
  GithubIcon 
} from 'lucide-react';
import { useAuth } from '../lib/hooks/useAuth';
import { useProfile } from '../lib/hooks/useProfile';
import { useModalStore } from '../lib/store';
import { useDarkMode } from '../lib/hooks/useDarkMode';

function Navbar() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { openAuthModal } = useModalStore();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(searchQuery)}`);
  };
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);
  
  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };
  
  const username = profile?.username || user?.email?.split('@')[0] || 'User';
  const avatarUrl = profile?.avatar_url;
  
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60 shadow-sm border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 py-3 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-xl font-bold flex items-center"
            onClick={closeAllMenus}
          >
            <Heart className="h-6 w-6 text-secondary mr-2" />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MemeGen
            </span>
          </Link>
          
          {/* Search bar (hide on mobile) */}
          <form 
            onSubmit={handleSearch} 
            className="hidden md:flex relative max-w-md flex-1 mx-4"
          >
            <input
              type="text"
              placeholder="Search memes"
              className="input w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          </form>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/create" 
              className="btn btn-secondary"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Meme
            </Link>
            
            <button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            
            {user ? (
              <div className="relative">
                <button 
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={username} 
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
                
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400 border-b dark:border-slate-700">
                      <p>Signed in as</p>
                      <p className="font-medium text-slate-900 dark:text-white truncate">{username}</p>
                    </div>
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center"
                      onClick={closeAllMenus}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <button 
                      onClick={() => {
                        signOut();
                        closeAllMenus();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={openAuthModal}
                className="btn btn-primary"
              >
                Sign in
              </button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
        
        {/* Mobile search bar */}
        <form 
          onSubmit={handleSearch} 
          className="mt-3 md:hidden relative"
        >
          <input
            type="text"
            placeholder="Search memes"
            className="input w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        </form>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-slate-200 dark:border-slate-700">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-lg font-medium transition ${
                  location.pathname === "/" 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={closeAllMenus}
              >
                Home
              </Link>
              <Link 
                to="/create" 
                className={`px-3 py-2 rounded-lg font-medium transition ${
                  location.pathname === "/create" 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={closeAllMenus}
              >
                Create Meme
              </Link>
              
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    className={`px-3 py-2 rounded-lg font-medium transition ${
                      location.pathname === "/profile" 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    onClick={closeAllMenus}
                  >
                    Profile
                  </Link>
                  <button 
                    onClick={() => {
                      signOut();
                      closeAllMenus();
                    }}
                    className="px-3 py-2 rounded-lg font-medium text-left text-error transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    openAuthModal();
                    closeAllMenus();
                  }}
                  className="btn btn-primary w-full justify-center"
                >
                  Sign in
                </button>
              )}
              
              <div className="flex items-center justify-between px-3 py-2">
                <span className="font-medium">Dark Mode</span>
                <button 
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;