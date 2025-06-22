import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getImageUrl } from '@/config/api';
import type { ProductImage } from '@/types';
import { Star, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageGalleryProps {
  images: ProductImage[];
  variantName: string;
  onSetMain?: (imageId: number) => void;
  onDelete?: (imageId: number) => void;
  className?: string;
}

export function ImageGallery({ 
  images, 
  variantName, 
  onSetMain, 
  onDelete, 
  className = "" 
}: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className={`flex items-center justify-center h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-sm">Нет изображений</div>
          <div className="text-xs">Добавьте изображения для этого варианта</div>
        </div>
      </div>
    );
  }

  const handlePrevious = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSelectedImageIndex(null);
    } else if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  return (
    <>
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 ${className}`}>
        {images.map((image, index) => (
          <div key={image.id} className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden border cursor-pointer hover:border-blue-300 transition-colors">
              <img
                src={getImageUrl(image.url)}
                alt={`${variantName} - изображение ${index + 1}`}
                className="w-full h-full object-cover"
                onClick={() => setSelectedImageIndex(index)}
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIHN0cm9rZT0iI0QxRDVEMyIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0yMCAyMEw0NCA0NCIgc3Ryb2tlPSIjRDFENUQzIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTQ0IDIwTDIwIDQ0IiBzdHJva2U9IiNEMUQ1RDMiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
                }}
              />
            </div>
            
            {/* Overlay с действиями */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                {!image.is_main && onSetMain && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white text-black hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetMain(image.id);
                    }}
                  >
                    <Star className="h-3 w-3" />
                  </Button>
                )}
                
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white text-red-600 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(image.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Бейдж главного изображения */}
            {image.is_main && (
              <div className="absolute top-1 left-1">
                <Badge className="bg-yellow-100 text-yellow-800 flex items-center space-x-1 text-xs">
                  <Star className="h-3 w-3" />
                  <span>Главное</span>
                </Badge>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Модальное окно для просмотра изображения */}
      {selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImageIndex(null)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 bg-white text-black hover:bg-gray-100 z-10"
              onClick={() => setSelectedImageIndex(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="relative">
              <img
                src={getImageUrl(images[selectedImageIndex].url)}
                alt={`${variantName} - изображение ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              
              {images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white text-black hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevious();
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-black hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 