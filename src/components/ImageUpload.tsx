import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, XCircle, Loader2 } from 'lucide-react';

interface FileUpload {
  file: File;
  preview: string;
  id: string;
}

interface ImageUploadProps {
  onFilesSelect: (files: File[]) => void;
  uploadingFiles: { file: File, progress: number, error?: string }[];
  className?: string;
  maxFiles?: number;
}

export function ImageUpload({
  onFilesSelect, 
  uploadingFiles = [],
  className = '',
  maxFiles = 5 
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileUpload[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${file.name}-${file.size}-${Date.now()}`
    }));

    const allFiles = [...selectedFiles, ...newFiles];
    const uniqueFiles = allFiles.filter((v,i,a)=>a.findIndex(t=>(t.file.name === v.file.name && t.file.size===v.file.size))===i);
    const finalFiles = uniqueFiles.slice(0, maxFiles);

    setSelectedFiles(finalFiles);
    onFilesSelect(finalFiles.map(f => f.file));
    
    if (fileRejections.length > 0) {
      // TODO: Показать уведомление об ошибке
      console.warn('Некоторые файлы были отклонены:', fileRejections);
    }
  }, [selectedFiles, onFilesSelect, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles,
  });
  
  const removeFile = (id: string) => {
    const newFiles = selectedFiles.filter(f => f.id !== id);
    setSelectedFiles(newFiles);
    onFilesSelect(newFiles.map(f => f.file));
  };

  const getUploadStatus = (file: File) => {
    return uploadingFiles.find(f => f.file.name === file.name && f.file.size === file.size);
  };

  const filesToDisplay = selectedFiles.map(sf => {
    const uploadStatus = getUploadStatus(sf.file);
    return { ...sf, uploadStatus };
  });

  return (
    <div className={className}>
      <div 
        {...getRootProps()} 
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <UploadCloud className="h-12 w-12 text-gray-400" />
          <p className="mt-2 font-semibold text-gray-700">
            {isDragActive ? 'Отпустите файлы сюда' : 'Перетащите файлы или нажмите для выбора'}
          </p>
          <p className="text-sm text-gray-500">
            PNG, JPG, GIF, WEBP до 5МБ. Максимум {maxFiles} файлов.
          </p>
        </div>
          </div>

      {filesToDisplay.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="font-semibold">Выбранные файлы:</h4>
          {filesToDisplay.map(({ file, preview, id, uploadStatus }) => (
            <div key={id} className="flex items-center space-x-3 p-2 border rounded-lg">
              <img src={preview} alt={file.name} className="h-16 w-16 object-cover rounded-md" />
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                {uploadStatus && uploadStatus.progress < 100 && (
                   <Progress value={uploadStatus.progress} className="w-full h-2 mt-1" />
                )}
                {uploadStatus && uploadStatus.error && (
                  <p className="text-xs text-red-500 mt-1">{uploadStatus.error}</p>
            )}
          </div>
              {(!uploadStatus || uploadStatus.progress >= 100) ? (
                <Button variant="ghost" size="sm" onClick={() => removeFile(id)}>
                  <XCircle className="h-5 w-5 text-gray-500 hover:text-red-500" />
                      </Button>
              ) : (
                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                    )}
                  </div>
            ))}
        </div>
      )}
    </div>
  );
}
