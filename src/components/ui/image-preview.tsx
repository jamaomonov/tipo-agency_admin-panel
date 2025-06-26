import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export function ImagePreview({ src, alt, onClose }: ImagePreviewProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 full-screen-mobile"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full h-full flex flex-col">
        {/* Панель инструментов */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center space-x-1 sm:space-x-2 bg-black bg-opacity-50 rounded-lg p-1 sm:p-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.25}
            className="text-white hover:bg-white hover:bg-opacity-20 h-8 w-8 sm:h-9 sm:w-9 p-0"
          >
            <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          
          <span className="text-white text-xs sm:text-sm min-w-[2rem] sm:min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 3}
            className="text-white hover:bg-white hover:bg-opacity-20 h-8 w-8 sm:h-9 sm:w-9 p-0"
          >
            <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRotate}
            className="text-white hover:bg-white hover:bg-opacity-20 h-8 w-8 sm:h-9 sm:w-9 p-0"
          >
            <RotateCw className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-white hover:bg-white hover:bg-opacity-20 h-8 w-8 sm:h-9 sm:w-9 p-0 text-xs"
          >
            <span className="hidden sm:inline">Сброс</span>
            <span className="sm:hidden">↺</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 h-8 w-8 sm:h-9 sm:w-9 p-0"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* Изображение */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-2 sm:p-4">
          <img
            src={src}
            alt={alt}
            className="transition-transform duration-200 max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center',
            }}
          />
        </div>
      </div>
    </div>
  );
} 