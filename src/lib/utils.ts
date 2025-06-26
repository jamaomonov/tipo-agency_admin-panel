import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { 
  ProductFormData, 
  ProductCreate, 
  ProductUpdate,
  ProductVariantFormData,
  ProductVariantCreate,
  ProductVariantUpdate,
  CategoryFormData,
  ProductCategoryCreate,
  ProductCategoryUpdate
} from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Утилиты для преобразования данных форм в API запросы
export function productFormToCreate(formData: ProductFormData): ProductCreate {
  return {
    name: formData.name,
    description: formData.description || null,
    category_id: formData.category_id,
    is_active: formData.is_active,
    is_new: formData.is_new,
    is_discounted: formData.is_discounted,
  };
}

export function productFormToUpdate(formData: ProductFormData): ProductUpdate {
  return {
    name: formData.name,
    description: formData.description || null,
    category_id: formData.category_id,
    is_active: formData.is_active,
    is_new: formData.is_new,
    is_discounted: formData.is_discounted,
  };
}

export function variantFormToCreate(formData: ProductVariantFormData): ProductVariantCreate {
  return {
    product_id: formData.product_id,
    price: formData.price,
    stock_quantity: formData.stock_quantity,
    color: formData.color || null,
    size: formData.size || null,
    material: formData.material || null,
  };
}

export function variantFormToUpdate(formData: ProductVariantFormData): ProductVariantUpdate {
  return {
    product_id: formData.product_id,
    price: formData.price,
    stock_quantity: formData.stock_quantity,
    color: formData.color || null,
    size: formData.size || null,
    material: formData.material || null,
  };
}

export function categoryFormToCreate(formData: CategoryFormData): ProductCategoryCreate {
  return {
    name: formData.name,
  };
}

export function categoryFormToUpdate(formData: CategoryFormData): ProductCategoryUpdate {
  return {
    name: formData.name,
  };
}

// Утилиты для форматирования
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Утилиты для работы с изображениями
export function getImageUrl(imageUrl: string): string {
  // Если URL уже полный, возвращаем как есть
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Иначе добавляем базовый URL API
  const baseUrl = 'http://localhost:8000';
  return `${baseUrl}${imageUrl}`;
}

// Утилиты для валидации
export function validatePrice(price: number): boolean {
  return price > 0 && price < 1000000;
}

export function validateStockQuantity(quantity: number): boolean {
  return quantity >= 0 && quantity < 100000;
}

export function validateProductName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 255;
}

export function validateCategoryName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 100;
}

// Утилиты для работы с файлами
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Неподдерживаемый формат файла' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'Файл слишком большой (максимум 5MB)' };
  }
  
  return { isValid: true };
}

// Утилиты для обработки ошибок валидации
export function getFieldError(fieldName: string, errors: Record<string, string>): string | undefined {
  return errors[fieldName];
}

export function hasFieldError(fieldName: string, errors: Record<string, string>): boolean {
  return !!errors[fieldName];
}
