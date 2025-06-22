import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import type { ProductImage, ProductImageFormData } from '@/types';

export interface ImageCreateRequest {
  variant_id: number;
  url: string;
  is_main: boolean;
}

export interface ImageUpdateRequest {
  variant_id?: number;
  url?: string;
  is_main?: boolean;
}

export class ImagesApiService {
  // Получить все изображения
  async getAll(): Promise<ProductImage[]> {
    const response = await apiClient.get<ProductImage[]>(API_ENDPOINTS.images);
    return response.data;
  }

  // Получить одно изображение по ID
  async getById(id: number): Promise<ProductImage> {
    const response = await apiClient.get<ProductImage>(API_ENDPOINTS.image(id));
    return response.data;
  }

  // Создать новое изображение
  async create(data: ProductImageFormData): Promise<ProductImage> {
    const formData = new FormData();
    formData.append('file', data.file);
    
    const endpoint = `${API_ENDPOINTS.images}?variant_id=${data.variant_id}&is_main=${data.is_main}`;
    
    const response = await apiClient.post<ProductImage>(endpoint, formData);
    return response.data;
  }

  // Обновить изображение (например, порядок)
  async update(id: number, data: Partial<ProductImage>): Promise<ProductImage> {
    const response = await apiClient.put<ProductImage>(API_ENDPOINTS.image(id), data);
    return response.data;
  }

  // Удалить изображение
  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.image(id));
  }

  // Установить изображение как главное
  async setMain(id: number): Promise<ProductImage> {
    const response = await apiClient.put<ProductImage>(API_ENDPOINTS.image(id), { is_main: true });
    return response.data;
  }
}

export const imagesApi = new ImagesApiService(); 