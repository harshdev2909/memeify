import { Heart, GithubIcon, InstagramIcon, TwitterIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link 
              to="/" 
              className="text-xl font-bold flex items-center"
            >
              <Heart className="h-6 w-6 text-secondary mr-2" />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                MemeGen
              </span>
            </Link>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Create, share, and enjoy the best memes on the internet.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">Home</Link></li>
              <li><Link to="/create" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">Create Meme</Link></li>
              <li><Link to="/profile" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary">Profile</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Connect With Us</h3>
            <div className="flex space-x-4 mt-2">
              <a 
                href="https://github.com/harshsharma" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary"
                aria-label="GitHub"
              >
                <GithubIcon className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary"
                aria-label="Twitter"
              >
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 text-center">
          <p>© {new Date().getFullYear()} MemeGen. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;