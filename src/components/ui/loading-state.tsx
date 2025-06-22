import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ message = 'Загрузка данных...', size = 'md' }: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="p-6 flex items-center justify-center">
      <div className="flex items-center space-x-2">
        <Loader2 className={`${sizeClasses[size]} animate-spin`} />
        <span className="text-gray-600">{message}</span>
      </div>
    </div>
  );
} 