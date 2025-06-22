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
  category_id: number;
  is_active: boolean;
  is_new: boolean;
  is_discounted: boolean;
  category?: ProductCategory;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: number;
  product_id: number;
  price: number;
  stock_quantity: number;
  color?: string;
  size?: string;
  material?: string;
  product?: Product;
  images?: ProductImage[];
}

export interface ProductImage {
  id: number;
  variant_id: number;
  url: string;
  is_main: boolean;
  variant?: ProductVariant;
  filename?: string;
  size?: number;
  order?: number;
}

// Расширенный тип для варианта с полными данными
export interface ProductVariantWithDetails extends ProductVariant {
  product: Product;
  images: ProductImage[];
}

// Типы для форм
export interface CategoryFormData {
  name: string;
  slug: string;
}

export interface ProductFormData {
  name: string;
  slug: string;
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

export interface ProductImageFormData {
  variant_id: number;
  is_main: boolean;
  file: File;
}

// Типы для таблиц и фильтров
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

export interface TableAction {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: any) => void;
  variant?: 'default' | 'destructive' | 'outline';
}

export interface FilterOptions {
  categories?: ProductCategory[];
  statuses?: string[];
  search?: string;
}

// Тип для загрузки файлов
export interface FileUpload {
  file: File;
  preview: string;
  id: string;
  progress?: number;
  error?: string;
}
