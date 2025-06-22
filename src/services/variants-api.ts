import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import type { ProductVariant, ProductVariantFormData, ProductVariantWithDetails } from '@/types';

// Согласно Swagger, VariantCreate и VariantUpdate
type VariantCreate = ProductVariantFormData;
type VariantUpdate = Partial<ProductVariantFormData>;

export interface VariantCreateRequest {
  product_id: number;
  price: number;
  stock_quantity?: number;
  color?: string;
  size?: string;
  material?: string;
}

export interface VariantUpdateRequest {
  product_id?: number;
  price?: number;
  stock_quantity?: number;
  color?: string;
  size?: string;
  material?: string;
}

export class VariantsApiService {
  // Получить все варианты
  async getAll(): Promise<ProductVariant[]> {
    const response = await apiClient.get<ProductVariant[]>(API_ENDPOINTS.variants);
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
  async create(data: ProductVariantFormData): Promise<ProductVariant> {
    const requestData: VariantCreate = data;
    const response = await apiClient.post<ProductVariant>(API_ENDPOINTS.variants, requestData);
    return response.data;
  }

  // Обновить вариант
  async update(id: number, data: ProductVariantFormData): Promise<ProductVariant> {
    const requestData: VariantUpdate = data;
    const response = await apiClient.put<ProductVariant>(API_ENDPOINTS.variant(id), requestData);
    return response.data;
  }

  // Удалить вариант
  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.variant(id));
  }
}

export const variantsApi = new VariantsApiService(); 