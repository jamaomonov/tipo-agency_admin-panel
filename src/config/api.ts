export const API_CONFIG = {
  base_url: 'http://localhost:8000',
  admin_prefix: '/admin',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

export const API_ENDPOINTS = {
  // Categories
  categories: '/api/v1/categories/',
  category: (id: number) => `/api/v1/categories/${id}`,
  
  // Products
  products: '/api/v1/products/',
  product: (id: number) => `/api/v1/products/${id}`,
  
  // Variants
  variants: '/api/v1/variants/',
  variant: (id: number) => `/api/v1/variants/${id}`,
  productVariants: (productId: number) => `/api/v1/variants/${productId}`,
  
  // Images
  images: '/api/v1/images/',
  image: (id: number) => `/api/v1/images/${id}`,
} as const;

export const getFullUrl = (endpoint: string): string => {
  return `${API_CONFIG.base_url}${API_CONFIG.admin_prefix}${endpoint}`;
};

export const getImageUrl = (imageUrl: string): string => {
  return `${API_CONFIG.base_url}${imageUrl}`;
}; 