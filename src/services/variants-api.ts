import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import type { ProductVariant, ProductVariantCreate, ProductVariantUpdate, ProductVariantWithDetails, PaginationParams } from '@/types';

export interface VariantsListParams extends PaginationParams {}

export class VariantsApiService {
  // Получить все варианты с пагинацией
  async getAll(params: VariantsListParams = {}): Promise<ProductVariant[]> {
    const searchParams = new URLSearchParams();
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    
    const endpoint = searchParams.toString() 
      ? `${API_ENDPOINTS.variants}?${searchParams.toString()}`
      : API_ENDPOINTS.variants;
      
    const response = await apiClient.get<ProductVariant[]>(endpoint);
    return response.data;
  }

  // Получить варианты конкретного товара
  async getByProductId(productId: number): Promise<ProductVariant[]> {
    const response = await apiClient.get<ProductVariant[]>(API_ENDPOINTS.productVariants(productId));
    return response.data;
  }

  // Получить один вариант по ID с полными данными
  async getById(id: number): Promise<ProductVariantWithDetails> {
    const response = await apiClient.get<ProductVariantWithDetails>(API_ENDPOINTS.variant(id));
    return response.data;
  }

  // Получить все варианты с полными данными (включая изображения)
  async getAllWithDetails(): Promise<ProductVariantWithDetails[]> {
    const response = await apiClient.get<ProductVariantWithDetails[]>(API_ENDPOINTS.variants);
    return response.data;
  }

  // Создать новый вариант
  async create(data: ProductVariantCreate): Promise<ProductVariant> {
    const response = await apiClient.post<ProductVariant>(API_ENDPOINTS.variants, data);
    return response.data;
  }

  // Обновить вариант
  async update(id: number, data: ProductVariantUpdate): Promise<ProductVariant> {
    const response = await apiClient.put<ProductVariant>(API_ENDPOINTS.variant(id), data);
    return response.data;
  }

  // Удалить вариант
  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.variant(id));
  }
}

export const variantsApi = new VariantsApiService(); 