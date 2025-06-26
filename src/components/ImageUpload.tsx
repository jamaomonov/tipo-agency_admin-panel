import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { validateImageFile, formatFileSize } from '@/lib/utils';

interface FileUpload {
  file: File;
  preview: string;
  id: string;
  error?: string;
}

interface ImageUploadProps {
  onFilesSelect: (files: File[]) => void;
  uploadingFiles: { file: File, progress: number, error?: string }[];
  className?: string;
  maxFiles?: number;
  maxFileSize?: number; // в байтах
  acceptedTypes?: string[];
  disabled?: boolean;
}

export function ImageUpload({
  onFilesSelect, 
  uploadingFiles = [],
  className = '',
  maxFiles = 5,
  maxFileSize = 5 * 1024 * 1024, // 5MB по умолчанию
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  disabled = false
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileUpload[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (disabled) return;

    // Валидация файлов
    const validFiles: FileUpload[] = [];
    const invalidFiles: FileUpload[] = [];

    acceptedFiles.forEach(file => {
      const validation = validateImageFile(file);
      const fileUpload: FileUpload = {
        file,
        preview: URL.createObjectURL(file),
        id: `${file.name}-${file.size}-${Date.now()}`,
        error: validation.isValid ? undefined : validation.error
      };

      if (validation.isValid) {
        validFiles.push(fileUpload);
      } else {
        invalidFiles.push(fileUpload);
      }
    });

    // Обработка отклоненных файлов
    fileRejections.forEach(({ file, errors }) => {
      const fileUpload: FileUpload = {
        file,
        preview: URL.createObjectURL(file),
        id: `${file.name}-${file.size}-${Date.now()}`,
        error: errors.map((e: any) => e.message).join(', ')
      };
      invalidFiles.push(fileUpload);
    });

    // Объединяем с существующими файлами
    const allFiles = [...selectedFiles, ...validFiles, ...invalidFiles];
    const uniqueFiles = allFiles.filter((v, i, a) => 
      a.findIndex(t => (t.file.name === v.file.name && t.file.size === v.file.size)) === i
    );
    const finalFiles = uniqueFiles.slice(0, maxFiles);

    setSelectedFiles(finalFiles);
    onFilesSelect(finalFiles.filter(f => !f.error).map(f => f.file));
    
    // Показываем ошибки в консоли для отладки
    if (invalidFiles.length > 0) {
      console.warn('Некоторые файлы были отклонены:', invalidFiles.map(f => ({ name: f.file.name, error: f.error })));
    }
  }, [selectedFiles, onFilesSelect, maxFiles, disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': acceptedTypes.map(type => type.replace('image/', '.')) },
    maxSize: maxFileSize,
    maxFiles,
    disabled,
  });
  
  const removeFile = (id: string) => {
    const newFiles = selectedFiles.filter(f => f.id !== id);
    setSelectedFiles(newFiles);
    onFilesSelect(newFiles.filter(f => !f.error).map(f => f.file));
  };

  const getUploadStatus = (file: File) => {
    return uploadingFiles.find(f => f.file.name === file.name && f.file.size === file.size);
  };

  const filesToDisplay = selectedFiles.map(sf => {
    const uploadStatus = getUploadStatus(sf.file);
    return { ...sf, uploadStatus };
  });

  const validFiles = filesToDisplay.filter(f => !f.error);
  const invalidFiles = filesToDisplay.filter(f => f.error);

  return (
    <div className={className}>
      <div 
        {...getRootProps()} 
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <div className="flex flex-col items-center">
          <UploadCloud className={`h-12 w-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="mt-2 font-semibold text-gray-700">
            {isDragActive ? 'Отпустите файлы сюда' : 'Перетащите файлы или нажмите для выбора'}
          </p>
          <p className="text-sm text-gray-500">
            {acceptedTypes.map(type => type.replace('image/', '').toUpperCase()).join(', ')} до {formatFileSize(maxFileSize)}. 
            Максимум {maxFiles} файлов.
          </p>
        </div>
      </div>

      {filesToDisplay.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Выбранные файлы:</h4>
            <div className="flex gap-2">
              {validFiles.length > 0 && (
                <Badge variant="secondary" className="text-green-700 bg-green-100">
                  {validFiles.length} валидных
                </Badge>
              )}
              {invalidFiles.length > 0 && (
                <Badge variant="destructive">
                  {invalidFiles.length} с ошибками
                </Badge>
              )}
            </div>
          </div>
          
          {filesToDisplay.map(({ file, preview, id, uploadStatus, error }) => (
            <div key={id} className={`flex items-center space-x-3 p-3 border rounded-lg ${
              error ? 'border-red-200 bg-red-50' : 'border-gray-200'
            }`}>
              <div className="relative">
                <img 
                  src={preview} 
                  alt={file.name} 
                  className="h-16 w-16 object-cover rounded-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyMEMyNS4zNzIgMjAgMjAgMjUuMzcyIDIwIDMyQzIwIDM4LjYyOCAyNS4zNzIgNDQgMzIgNDRDMzguNjI4IDQ0IDQ0IDM4LjYyOCA0NCAzMkM0NCAyNS4zNzIgMzguNjI4IDIwIDMyIDIwWiIgZmlsbD0iI0QxRDVEMTkiLz4KPC9zdmc+';
                  }}
                />
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-75 rounded-md">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
                {error && (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
                {uploadStatus && uploadStatus.progress < 100 && (
                  <div className="mt-2">
                    <Progress value={uploadStatus.progress} className="w-full h-2" />
                    <p className="text-xs text-gray-500 mt-1">{uploadStatus.progress}%</p>
                  </div>
                )}
                {uploadStatus && uploadStatus.error && (
                  <p className="text-xs text-red-500 mt-1">{uploadStatus.error}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {uploadStatus && uploadStatus.progress < 100 && !uploadStatus.error ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeFile(id)}
                    disabled={uploadStatus && uploadStatus.progress < 100}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
