export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  is_new: boolean;
  is_discounted: boolean;
  category: ProductCategory;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: number;
  product_id: number;
  price: number;
  stock_quantity: number;
  color?: string | null;
  size?: string | null;
  material?: string | null;
  product?: Product;
  images?: ProductImage[];
}

export interface ProductImage {
  id: number;
  variant_id: number;
  url: string;
  is_main: boolean;
  variant?: ProductVariant;
}

// Расширенный тип для варианта с полными данными (согласно swagger.json)
export interface ProductVariantWithDetails extends ProductVariant {
  product: Product;
  images: ProductImage[];
}

// Типы для API запросов (согласно swagger.json)
export interface ProductCreate {
  name: string;
  description?: string | null;
  category_id: number;
  is_active?: boolean | null;
  is_new?: boolean | null;
  is_discounted?: boolean | null;
}

export interface ProductUpdate {
  name?: string | null;
  description?: string | null;
  category_id?: number | null;
  is_active?: boolean | null;
  is_new?: boolean | null;
  is_discounted?: boolean | null;
}

export interface ProductVariantCreate {
  product_id: number;
  price: number;
  stock_quantity?: number | null;
  color?: string | null;
  size?: string | null;
  material?: string | null;
}

export interface ProductVariantUpdate {
  product_id?: number | null;
  price?: number | null;
  stock_quantity?: number | null;
  color?: string | null;
  size?: string | null;
  material?: string | null;
}

export interface ProductCategoryCreate {
  name: string;
}

export interface ProductCategoryUpdate {
  name?: string | null;
}

// Типы для форм (для внутреннего использования)
export interface ProductFormData {
  name: string;
  description: string;
  category_id: number;
  is_active: boolean;
  is_new: boolean;
  is_discounted: boolean;
}

export interface ProductVariantFormData {
  product_id: number;
  price: number;
  stock_quantity: number;
  color?: string;
  size?: string;
  material?: string;
}

export interface CategoryFormData {
  name: string;
}

// Типы для пагинации
export interface PaginationParams {
  skip?: number;
  limit?: number;
}

// Типы для ошибок API (согласно swagger.json)
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

// Типы для API запросов изображений (согласно swagger.json)
export interface ImageCreateRequest {
  variant_id: number;
  is_main: boolean;
  file: File;
}

export interface ImageUpdateRequest {
  is_main?: boolean | null;
  file?: File | null;
}
