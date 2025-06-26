import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import type { Product, ProductCreate, ProductUpdate, PaginationParams } from '@/types';

export interface ProductsListParams extends PaginationParams {}

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
  async create(data: ProductCreate): Promise<Product> {
    const response = await apiClient.post<Product>(API_ENDPOINTS.products, data);
    return response.data;
  }

  // Обновить товар
  async update(id: number, data: ProductUpdate): Promise<Product> {
    const response = await apiClient.put<Product>(API_ENDPOINTS.product(id), data);
    return response.data;
  }

  // Удалить товар
  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.product(id));
  }
}

export const productsApi = new ProductsApiService(); 