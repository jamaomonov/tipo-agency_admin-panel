import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api';
import type { ProductCategory, CategoryFormData } from '@/types';

// Согласно Swagger, CategoryCreate и CategoryUpdate
type CategoryCreate = CategoryFormData;
type CategoryUpdate = Partial<CategoryFormData>;

export interface CategoryCreateRequest {
  name: string;
}

export interface CategoryUpdateRequest {
  name?: string;
}

export class CategoriesApiService {
  // Получить все категории
  async getAll(): Promise<ProductCategory[]> {
    const response = await apiClient.get<ProductCategory[]>(API_ENDPOINTS.categories);
    return response.data;
  }

  // Получить одну категорию по ID
  async getById(id: number): Promise<ProductCategory> {
    const response = await apiClient.get<ProductCategory>(API_ENDPOINTS.category(id));
    return response.data;
  }

  // Создать новую категорию
  async create(data: CategoryFormData): Promise<ProductCategory> {
    const requestData: CategoryCreate = data;
    const response = await apiClient.post<ProductCategory>(API_ENDPOINTS.categories, requestData);
    return response.data;
  }

  // Обновить категорию
  async update(id: number, data: CategoryFormData): Promise<ProductCategory> {
    const requestData: CategoryUpdate = data;
    const response = await apiClient.put<ProductCategory>(API_ENDPOINTS.category(id), requestData);
    return response.data;
  }

  // Удалить категорию
  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.category(id));
  }
}

export const categoriesApi = new CategoriesApiService(); 