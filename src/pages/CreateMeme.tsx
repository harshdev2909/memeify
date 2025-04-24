import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Plus, X } from 'lucide-react';
import { useMemes } from '../lib/hooks/useMemes';
import { useNotificationStore } from '../lib/store';
import MemeEditor from '../components/MemeEditor';
import { dataUrlToFile } from '../lib/utils';
import confetti from 'canvas-confetti';

function CreateMeme() {
  const navigate = useNavigate();
  const { createMeme } = useMemes();
  const { addNotification } = useNotificationStore();
  
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [memeDataUrl, setMemeDataUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const handleAddTag = () => {
    const trimmedTag = currentTag.trim().toLowerCase();
    
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setCurrentTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const handleMemeGenerated = (dataUrl: string) => {
    setMemeDataUrl(dataUrl);
    
    // Scroll to form
    const formElement = document.getElementById('meme-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      addNotification('Please enter a title for your meme', 'error');
      return;
    }
    
    if (!memeDataUrl) {
      addNotification('Please generate a meme image first', 'error');
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Convert data URL to File
      const file = await dataUrlToFile(memeDataUrl, `meme-${Date.now()}.png`);
      
      const { data, error } = await createMeme({
        title: title.trim(),
        imageFile: file,
        tags: tags.length > 0 ? tags : ['untagged'],
      });
      
      if (error) throw error;
      
      // Fire confetti
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });
      
      addNotification('Your meme was created successfully!', 'success');
      
      // Redirect to home page
      navigate('/');
    } catch (err) {
      console.error('Error creating meme:', err);
      addNotification(
        err instanceof Error 
          ? err.message 
          : 'Failed to create meme. Please try again.',
        'error'
      );
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Create a Meme</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Design your own custom meme using our editor
      </p>
      
      {/* Meme editor */}
      <MemeEditor onSave={handleMemeGenerated} />
      
      {/* Meme details form */}
      <form 
        id="meme-form"
        onSubmit={handleSubmit}
        className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg"
      >
        <h2 className="text-xl font-bold mb-4">Meme Details</h2>
        
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title <span className="text-error">*</span>
            </label>
            <input
              id="title"
              type="text"
              className="input w-full"
              placeholder="Give your meme a catchy title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-1">
              Tags
            </label>
            <div className="flex">
              <div className="relative flex-1">
                <input
                  id="tags"
                  type="text"
                  className="input w-full pr-10"
                  placeholder="Add tags to help others find your meme"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  onClick={handleAddTag}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Tags list */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center text-sm bg-slate-100 dark:bg-slate-700 rounded-full px-3 py-1"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                    <button
                      type="button"
                      className="ml-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreating || !memeDataUrl}
            >
              {isCreating ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : null}
              {isCreating ? 'Creating...' : 'Create Meme'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateMeme;