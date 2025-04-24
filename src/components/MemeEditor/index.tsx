import { useState, useRef, useCallback } from 'react';
import { Stage, Layer, Image, Text } from 'react-konva';
import useImage from 'use-image';
import MemeEditorToolbar from './MemeEditorToolbar';
import TextControls from './TextControls';
import { v4 as uuidv4 } from 'uuid';

type TextElement = {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fill: string;
  draggable: boolean;
  width: number;
};

type ImageElement = {
  url: string;
  width: number;
  height: number;
};

function MemeEditor({ 
  onSave 
}: { 
  onSave: (dataUrl: string) => void;
}) {
  const [image, setImage] = useState<ImageElement | null>(null);
  const [texts, setTexts] = useState<TextElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const stageRef = useRef<any>(null);
  
  // Load template image
  const [konvaImage] = useImage(image?.url || '', 'anonymous');
  
  // Add a new text element
  const addText = () => {
    if (!image) return;
    
    const id = uuidv4();
    const newText: TextElement = {
      id,
      text: 'ADD TEXT HERE',
      x: image.width / 2,
      y: image.height / 2,
      fontSize: 36,
      fill: 'white',
      draggable: true,
      width: 300,
    };
    
    setTexts([...texts, newText]);
    setSelectedTextId(id);
  };
  
  // Update text properties
  const updateText = (id: string, props: Partial<TextElement>) => {
    setTexts(
      texts.map(t => (t.id === id ? { ...t, ...props } : t))
    );
  };
  
  // Remove selected text
  const removeSelectedText = () => {
    if (!selectedTextId) return;
    setTexts(texts.filter(t => t.id !== selectedTextId));
    setSelectedTextId(null);
  };
  
  // Calculate image dimensions
  const calculateDimensions = (width: number, height: number) => {
    const maxWidth = 600;
    const maxHeight = 600;
    
    let newWidth = width;
    let newHeight = height;
    
    if (width > maxWidth) {
      const ratio = maxWidth / width;
      newWidth = maxWidth;
      newHeight = height * ratio;
    }
    
    if (newHeight > maxHeight) {
      const ratio = maxHeight / newHeight;
      newHeight = maxHeight;
      newWidth = newWidth * ratio;
    }
    
    return { width: newWidth, height: newHeight };
  };
  
  // Handle file upload
  const handleImageUpload = (file: File) => {
    if (typeof window === 'undefined') return;
    
    setIsImageLoading(true);
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    
    img.onload = () => {
      const { width, height } = calculateDimensions(img.width, img.height);
      
      setImage({
        url,
        width,
        height,
      });
      
      setTexts([]);
      setSelectedTextId(null);
      setIsImageLoading(false);
    };
    
    img.onerror = () => {
      setIsImageLoading(false);
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  };
  
  // Handle selecting a built-in template
  const handleTemplateSelect = (templateUrl: string) => {
    if (typeof window === 'undefined') return;
    
    setIsImageLoading(true);
    const img = new window.Image();
    
    img.onload = () => {
      const { width, height } = calculateDimensions(img.width, img.height);
      
      setImage({
        url: templateUrl,
        width,
        height,
      });
      
      setTexts([]);
      setSelectedTextId(null);
      setIsImageLoading(false);
    };
    
    img.onerror = () => {
      setIsImageLoading(false);
    };
    
    img.crossOrigin = 'anonymous';
    img.src = templateUrl;
  };
  
  // Generate image data URL
  const generateMeme = useCallback(() => {
    if (!stageRef.current || !image) return;
    
    setSelectedTextId(null);
    
    const dataUrl = stageRef.current.toDataURL({
      pixelRatio: 2,
      mimeType: 'image/png'
    });
    
    onSave(dataUrl);
  }, [image, onSave]);
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
      <MemeEditorToolbar 
        onAddText={addText}
        onRemoveText={removeSelectedText}
        onGenerateMeme={generateMeme}
        canAddText={!!image}
        canRemoveText={!!selectedTextId}
        canGenerateMeme={!!image && !!konvaImage}
        onImageUpload={handleImageUpload}
        onTemplateSelect={handleTemplateSelect}
      />
      
      <div className="p-6 flex flex-col items-center">
        {isImageLoading ? (
          <div className="w-full max-w-md h-80 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center p-6">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 dark:text-slate-400">Loading image...</p>
          </div>
        ) : image ? (
          <div 
            className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900"
            style={{ 
              width: image.width, 
              height: image.height,
              margin: '0 auto'
            }}
          >
            <Stage
              width={image.width}
              height={image.height}
              ref={stageRef}
              onClick={(e) => {
                if (e.target === e.target.getStage()) {
                  setSelectedTextId(null);
                }
              }}
            >
              <Layer>
                {konvaImage && (
                  <Image
                    image={konvaImage}
                    width={image.width}
                    height={image.height}
                  />
                )}
                
                {texts.map((text) => (
                  <Text
                    key={text.id}
                    text={text.text}
                    x={text.x}
                    y={text.y}
                    fontSize={text.fontSize}
                    fill={text.fill}
                    fontFamily="Impact"
                    draggable={text.draggable}
                    width={text.width}
                    align="center"
                    stroke="black"
                    strokeWidth={1}
                    lineHeight={1.2}
                    onClick={() => setSelectedTextId(text.id)}
                    onTap={() => setSelectedTextId(text.id)}
                    onDragEnd={(e) => {
                      updateText(text.id, {
                        x: e.target.x(),
                        y: e.target.y(),
                      });
                    }}
                    onTransformEnd={(e) => {
                      updateText(text.id, {
                        width: e.target.width(),
                        fontSize: e.target.fontSize(),
                      });
                    }}
                  />
                ))}
              </Layer>
            </Stage>
          </div>
        ) : (
          <div className="w-full max-w-md h-80 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center p-6 text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Start by uploading an image or selecting a template
            </p>
          </div>
        )}
        
        {selectedTextId && (
          <TextControls
            text={texts.find(t => t.id === selectedTextId)!}
            onChange={(props) => updateText(selectedTextId, props)}
          />
        )}
      </div>
    </div>
  );
}

export default MemeEditor;