import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import type { Product, ProductFormData } from '@/types';

// Согласно Swagger, ProductCreate и ProductUpdate - это ProductFormData
type ProductCreate = ProductFormData;
type ProductUpdate = Partial<ProductFormData>;

export interface ProductsListParams {
  skip?: number;
  limit?: number;
}

export class ProductsApiService {
  // Получить все товары с пагинацией
  async getAll(params: ProductsListParams = {}): Promise<Product[]> {
    const searchParams = new URLSearchParams();
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    
    const endpoint = searchParams.toString() 
      ? `${API_ENDPOINTS.products}?${searchParams.toString()}`
      : API_ENDPOINTS.products;
      
    const response = await apiClient.get<Product[]>(endpoint);
    return response.data;
  }

  // Получить один товар по ID
  async getById(id: number): Promise<Product> {
    const response = await apiClient.get<Product>(API_ENDPOINTS.product(id));
    return response.data;
  }

  // Создать новый товар
  async create(data: ProductFormData): Promise<Product> {
    const requestData: ProductCreate = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      category_id: data.category_id,
      is_active: data.is_active,
      is_new: data.is_new,
      is_discounted: data.is_discounted,
    };
    const response = await apiClient.post<Product>(API_ENDPOINTS.products, requestData);
    return response.data;
  }

  // Обновить товар
  async update(id: number, data: ProductFormData): Promise<Product> {
    // Отправляем только измененные поля, как ожидает ProductUpdate
    const requestData: ProductUpdate = data;
    const response = await apiClient.put<Product>(API_ENDPOINTS.product(id), requestData);
    return response.data;
  }

  // Удалить товар
  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.product(id));
  }
}

export const productsApi = new ProductsApiService(); 