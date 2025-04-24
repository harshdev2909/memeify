import { useState } from 'react';
import { GithubIcon } from 'lucide-react';

function Watermark() {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <a
      href="https://github.com/harshdev2909"
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-50 flex items-center bg-slate-900/80 dark:bg-slate-700/80 
        text-white rounded-full px-4 py-2 shadow-lg transition-all duration-300 backdrop-blur-sm
        ${isHovered ? 'scale-110' : 'scale-100'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered 
          ? '0 0 15px 2px rgba(122, 149, 255, 0.7), 0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      <GithubIcon className="h-4 w-4 mr-2" />
      <span className="text-sm font-medium">Built by Harsh Sharma</span>
    </a>
  );
}

export default Watermark;