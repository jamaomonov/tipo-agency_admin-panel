export interface Category {
  id: string;
  name: string;
  slug: string;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  category?: Category;
  status: 'active' | 'inactive' | 'draft';
  is_active: boolean;
  is_new: boolean;
  is_discounted: boolean;
  updatedAt: Date;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  product?: Product;
  color?: string;
  size?: string;
  material?: string;
  price?: number; // В сумах (UZS)
  stock: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  variantId: string;
  variant?: ProductVariant;
  url: string;
  filename: string;
  size: number; // в байтах
  mimeType: string;
  isMain: boolean; // главное изображение для варианта
  order: number; // порядок отображения
  createdAt: Date;
}

// Типы для форм
export interface CategoryFormData {
  name: string;
  slug: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  categoryId: string;
  status: 'active' | 'inactive' | 'draft';
  is_active: boolean;
  is_new: boolean;
  is_discounted: boolean;
}

export interface ProductVariantFormData {
  productId: string;
  color?: string;
  size?: string;
  material?: string;
  price?: number;
  stock: number;
  status: 'active' | 'inactive';
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
  categories?: Category[];
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
