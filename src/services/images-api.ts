import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import type { ProductImage, PaginationParams, ImageCreateRequest, ImageUpdateRequest } from '@/types';

export interface ImagesListParams extends PaginationParams {}

export class ImagesApiService {
  // Получить все изображения с пагинацией
  async getAll(params: ImagesListParams = {}): Promise<ProductImage[]> {
    const searchParams = new URLSearchParams();
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    
    const endpoint = searchParams.toString() 
      ? `${API_ENDPOINTS.images}?${searchParams.toString()}`
      : API_ENDPOINTS.images;
      
    const response = await apiClient.get<ProductImage[]>(endpoint);
    return response.data;
  }

  // Получить одно изображение по ID
  async getById(id: number): Promise<ProductImage> {
    const response = await apiClient.get<ProductImage>(API_ENDPOINTS.image(id));
    return response.data;
  }

  // Создать новое изображение
  async create(data: ImageCreateRequest): Promise<ProductImage> {
    const formData = new FormData();
    formData.append('file', data.file);
    
    const endpoint = `${API_ENDPOINTS.images}?variant_id=${data.variant_id}&is_main=${data.is_main}`;
    
    const response = await apiClient.post<ProductImage>(endpoint, formData);
    return response.data;
  }

  // Обновить изображение
  async update(id: number, data: ImageUpdateRequest): Promise<ProductImage> {
    const formData = new FormData();
    if (data.file) {
      formData.append('file', data.file);
    }
    
    const searchParams = new URLSearchParams();
    if (data.is_main !== undefined && data.is_main !== null) {
      searchParams.append('is_main', data.is_main.toString());
    }
    
    const endpoint = searchParams.toString() 
      ? `${API_ENDPOINTS.image(id)}?${searchParams.toString()}`
      : API_ENDPOINTS.image(id);
    
    const response = await apiClient.put<ProductImage>(endpoint, formData);
    return response.data;
  }

  // Удалить изображение
  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.image(id));
  }

  // Установить изображение как главное
  async setMain(id: number): Promise<ProductImage> {
    const endpoint = `${API_ENDPOINTS.image(id)}?is_main=true`;
    const response = await apiClient.put<ProductImage>(endpoint, new FormData());
    return response.data;
  }
}

export const imagesApi = new ImagesApiService(); 