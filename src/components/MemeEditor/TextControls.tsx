import { ChangeEvent } from 'react';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

type TextElement = {
  id: string;
  text: string;
  fontSize: number;
  fill: string;
  width: number;
};

type TextControlsProps = {
  text: TextElement;
  onChange: (props: Partial<TextElement>) => void;
};

function TextControls({ text, onChange }: TextControlsProps) {
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ text: e.target.value });
  };
  
  const handleFontSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({ fontSize: parseInt(e.target.value, 10) });
  };
  
  const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({ fill: e.target.value });
  };
  
  return (
    <div className="mt-6 w-full max-w-md p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      <h3 className="font-medium mb-3">Text Options</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="text-content" className="block text-sm font-medium mb-1">
            Text Content
          </label>
          <textarea
            id="text-content"
            className="input w-full h-20"
            value={text.text}
            onChange={handleTextChange}
          />
        </div>
        
        <div>
          <label htmlFor="font-size" className="block text-sm font-medium mb-1">
            Font Size: {text.fontSize}px
          </label>
          <input
            id="font-size"
            type="range"
            min="12"
            max="72"
            value={text.fontSize}
            onChange={handleFontSizeChange}
            className="w-full"
          />
        </div>
        
        <div>
          <label htmlFor="text-color" className="block text-sm font-medium mb-1">
            Text Color
          </label>
          <div className="flex items-center">
            <input
              id="text-color"
              type="color"
              value={text.fill}
              onChange={handleColorChange}
              className="h-8 w-8 rounded overflow-hidden"
            />
            <input
              type="text"
              value={text.fill}
              onChange={(e) => onChange({ fill: e.target.value })}
              className="input ml-2 w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextControls;