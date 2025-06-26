import { API_CONFIG, getFullUrl } from '@/config/api';
import type { ValidationError } from '@/types';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
  validationErrors?: ValidationError[];
}

class ApiClient {
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data: any = null,
  ): Promise<ApiResponse<T>> {
    const [pathname, search] = endpoint.split('?');
    const url = getFullUrl(pathname) + (search ? `?${search}` : '');
    const options: RequestInit = {
      method,
      headers: { ...API_CONFIG.headers },
      signal: AbortSignal.timeout(API_CONFIG.timeout),
    };

    if (data) {
      if (data instanceof FormData) {
        // Если это FormData, не устанавливаем 'Content-Type', браузер сделает это сам
        delete (options.headers as Record<string, string>)['Content-Type'];
        options.body = data;
      } else {
        options.body = JSON.stringify(data);
      }
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: 'Произошла ошибка на сервере.' };
        }
        
        // Обработка ошибок валидации (422)
        if (response.status === 422 && errorData.detail) {
          const validationErrors = errorData.detail as ValidationError[];
          const fieldErrors: Record<string, string[]> = {};
          
          validationErrors.forEach(error => {
            const field = error.loc[error.loc.length - 1] as string;
            if (!fieldErrors[field]) {
              fieldErrors[field] = [];
            }
            fieldErrors[field].push(error.msg);
          });
          
          throw {
            message: 'Ошибка валидации данных',
            status: response.status,
            errors: fieldErrors,
            validationErrors: validationErrors,
          } as ApiError;
        }
        
        throw {
          message: errorData.detail || errorData.message || 'Ошибка запроса',
          status: response.status,
          errors: errorData.errors || {},
        } as ApiError;
      }
      
      if (response.status === 204) {
        // No Content
        return { data: null as T, status: response.status };
      }

      const responseData = await response.json();
      return { data: responseData, status: response.status };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw {
          message: 'Превышено время ожидания запроса',
          status: 408,
        } as ApiError;
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint);
  }

  async post<T>(endpoint:string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data);
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint);
  }
}

export const apiClient = new ApiClient(); 