import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { ApiError } from '@/lib/api-client';

interface ApiErrorProps {
  error: ApiError;
  onRetry?: () => void;
  title?: string;
}

export function ApiError({ error, onRetry, title = 'Ошибка загрузки данных' }: ApiErrorProps) {
  return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-red-800 font-medium">{title}</h3>
            <p className="text-red-600 mt-1">{error.message}</p>
            {error.errors && Object.keys(error.errors).length > 0 && (
              <div className="mt-2">
                <p className="text-red-600 text-sm font-medium">Детали ошибки:</p>
                <ul className="mt-1 text-sm text-red-600">
                  {Object.entries(error.errors).map(([field, messages]) => (
                    <li key={field}>
                      <span className="font-medium">{field}:</span> {messages.join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {onRetry && (
              <Button 
                onClick={onRetry} 
                variant="outline" 
                size="sm"
                className="mt-3"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Попробовать снова
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 