import { useState } from 'react';
import { Upload, Text, Trash2, Download, Image, ChevronDown } from 'lucide-react';

// Sample meme templates
const MEME_TEMPLATES = [
  {
    name: 'Drake Hotline Bling',
    url: 'https://images.pexels.com/photos/3195482/pexels-photo-3195482.jpeg'
  },
  {
    name: 'Distracted Boyfriend',
    url: 'https://images.pexels.com/photos/5257537/pexels-photo-5257537.jpeg'
  },
  {
    name: 'Change My Mind',
    url: 'https://images.pexels.com/photos/8088448/pexels-photo-8088448.jpeg'
  },
  {
    name: 'Two Buttons',
    url: 'https://images.pexels.com/photos/1918290/pexels-photo-1918290.jpeg'
  }
];

type MemeEditorToolbarProps = {
  onAddText: () => void;
  onRemoveText: () => void;
  onGenerateMeme: () => void;
  canAddText: boolean;
  canRemoveText: boolean;
  canGenerateMeme: boolean;
  onImageUpload: (file: File) => void;
  onTemplateSelect: (templateUrl: string) => void;
};

function MemeEditorToolbar({
  onAddText,
  onRemoveText,
  onGenerateMeme,
  canAddText,
  canRemoveText,
  canGenerateMeme,
  onImageUpload,
  onTemplateSelect
}: MemeEditorToolbarProps) {
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };
  
  return (
    <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-3 flex flex-wrap items-center gap-2">
      {/* Image upload button */}
      <div>
        <input
          type="file"
          id="image-upload"
          className="sr-only"
          accept="image/*"
          onChange={handleFileChange}
        />
        <label
          htmlFor="image-upload"
          className="btn btn-primary cursor-pointer"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Image
        </label>
      </div>
      
      {/* Templates dropdown */}
      <div className="relative">
        <button
          className="btn btn-ghost"
          onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
        >
          <Image className="h-4 w-4 mr-2" />
          Templates
          <ChevronDown className="h-4 w-4 ml-1" />
        </button>
        
        {isTemplateMenuOpen && (
          <div className="absolute z-10 mt-1 w-56 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700">
            <ul className="py-1">
              {MEME_TEMPLATES.map((template) => (
                <li key={template.name}>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center"
                    onClick={() => {
                      onTemplateSelect(template.url);
                      setIsTemplateMenuOpen(false);
                    }}
                  >
                    {template.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="h-6 border-r border-slate-300 dark:border-slate-600 mx-1"></div>
      
      {/* Text controls */}
      <button
        className="btn btn-ghost"
        onClick={onAddText}
        disabled={!canAddText}
      >
        <Text className="h-4 w-4 mr-2" />
        Add Text
      </button>
      
      <button
        className="btn btn-ghost text-error"
        onClick={onRemoveText}
        disabled={!canRemoveText}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Remove Text
      </button>
      
      <div className="flex-1"></div>
      
      {/* Generate button */}
      <button
        className="btn btn-accent"
        onClick={onGenerateMeme}
        disabled={!canGenerateMeme}
      >
        <Download className="h-4 w-4 mr-2" />
        Generate Meme
      </button>
    </div>
  );
}

export default MemeEditorToolbar;