import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FileUpload } from '@/types';
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  Eye,
  Star,
  StarOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onFilesChange: (files: FileUpload[]) => void;
  maxFiles?: number;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
  initialFiles?: FileUpload[];
}

export function ImageUpload({
  onFilesChange,
  maxFiles = 10,
  maxSizeInMB = 5,
  acceptedFormats = ['jpg', 'jpeg', 'png'],
  initialFiles = []
}: ImageUploadProps) {
  const [files, setFiles] = useState<FileUpload[]>(initialFiles);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Проверка типа файла
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !acceptedFormats.includes(fileExtension)) {
      return `Неподдерживаемый формат. Разрешены: ${acceptedFormats.join(', ')}`;
    }

    // Проверка размера файла
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSizeInMB) {
      return `Файл слишком большой. Максимальный размер: ${maxSizeInMB}MB`;
    }

    return null;
  };

  const createFileUpload = (file: File): FileUpload => {
    return {
      file,
      preview: URL.createObjectURL(file),
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  };

  const handleFiles = useCallback((newFiles: File[]) => {
    const validFiles: FileUpload[] = [];
    const errors: string[] = [];

    for (const file of newFiles) {
      if (files.length + validFiles.length >= maxFiles) {
        errors.push(`Превышено максимальное количество файлов (${maxFiles})`);
        break;
      }

      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        const fileUpload = createFileUpload(file);
        validFiles.push(fileUpload);

        // Симуляция загрузки
        simulateUpload(fileUpload.id);
      }
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }
  }, [files, maxFiles, onFilesChange]);

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      } else {
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      }
    }, 200);
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);

    // Освобождаем URL объекта
    const fileToRemove = files.find(f => f.id === fileId);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const setMainImage = (fileId: string) => {
    // В реальном приложении здесь бы была логика установки главного изображения
    alert(`Установить как главное изображение: ${fileId}`);
  };

  const previewImage = (file: FileUpload) => {
    window.open(file.preview, '_blank');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);

    // Сбрасываем input для возможности повторного выбора того же файла
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 px-6 text-center">
          <Upload className={cn(
            "h-12 w-12 mb-4",
            isDragOver ? "text-blue-500" : "text-gray-400"
          )} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Загрузите изображения
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Перетащите файлы сюда или нажмите для выбора
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
            <span>Форматы: {acceptedFormats.map(f => f.toUpperCase()).join(', ')}</span>
            <span>•</span>
            <span>Макс. размер: {maxSizeInMB}MB</span>
            <span>•</span>
            <span>Макс. файлов: {maxFiles}</span>
          </div>

          {files.length >= maxFiles && (
            <div className="flex items-center mt-2 text-amber-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">Достигнуто максимальное количество файлов</span>
            </div>
          )}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFormats.map(f => `.${f}`).join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Загруженные файлы ({files.length}/{maxFiles})
            </h4>
            {files.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  files.forEach(file => URL.revokeObjectURL(file.preview));
                  setFiles([]);
                  onFilesChange([]);
                }}
              >
                Очистить все
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <Card key={file.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Image Preview */}
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Actions Overlay */}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          previewImage(file);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMainImage(file.id);
                        }}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Upload Progress */}
                    {uploadProgress[file.id] !== undefined && (
                      <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${uploadProgress[file.id]}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">
                            {Math.round(uploadProgress[file.id])}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="p-3">
                    <div className="text-sm font-medium text-gray-900 truncate" title={file.file.name}>
                      {file.file.name}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {formatFileSize(file.file.size)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {file.file.type.split('/')[1]?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
