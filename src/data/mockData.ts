import type { ProductCategory, Product, ProductVariant, ProductImage } from '@/types';

export const mockCategories: ProductCategory[] = [
  {
    id: 1,
    name: 'Одежда',
    slug: 'clothes',
  },
  {
    id: 2,
    name: 'Обувь',
    slug: 'shoes',
  },
  {
    id: 3,
    name: 'Аксессуары',
    slug: 'accessories',
  },
];

export const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Футболка Premium',
    slug: 'futbolka-premium',
    description: 'Высококачественная хлопковая футболка с современным дизайном',
    category_id: 1,
    is_active: true,
    is_new: true,
    is_discounted: false,
    category: mockCategories[0],
  },
  {
    id: 2,
    name: 'Кроссовки Спорт',
    slug: 'krossovki-sport',
    description: 'Удобные кроссовки для занятий спортом и повседневной носки',
    category_id: 2,
    is_active: true,
    is_new: false,
    is_discounted: true,
    category: mockCategories[1],
  },
  {
    id: 3,
    name: 'Рюкзак Городской',
    slug: 'ryukzak-gorodskoy',
    description: 'Стильный рюкзак для работы и путешествий',
    category_id: 3,
    is_active: false,
    is_new: false,
    is_discounted: false,
    category: mockCategories[2],
  },
];

export const mockVariants: ProductVariant[] = [
  {
    id: 1,
    product_id: 1,
    price: 25000,
    stock_quantity: 25,
    color: 'Белый',
    size: 'M',
    material: 'Хлопок 100%',
    product: mockProducts[0],
  },
  {
    id: 2,
    product_id: 1,
    price: 25000,
    stock_quantity: 18,
    color: 'Белый',
    size: 'L',
    material: 'Хлопок 100%',
    product: mockProducts[0],
  },
  {
    id: 3,
    product_id: 1,
    price: 25000,
    stock_quantity: 30,
    color: 'Черный',
    size: 'M',
    material: 'Хлопок 100%',
    product: mockProducts[0],
  },
  {
    id: 4,
    product_id: 2,
    price: 85000,
    stock_quantity: 12,
    color: 'Белый',
    size: '42',
    material: 'Кожа/Текстиль',
    product: mockProducts[1],
  },
  {
    id: 5,
    product_id: 2,
    price: 85000,
    stock_quantity: 8,
    color: 'Черный',
    size: '43',
    material: 'Кожа/Текстиль',
    product: mockProducts[1],
  },
  {
    id: 6,
    product_id: 3,
    price: 45000,
    stock_quantity: 0,
    color: 'Черный',
    material: 'Нейлон',
    product: mockProducts[2],
  },
];

export const mockImages: ProductImage[] = [
  {
    id: 1,
    variant_id: 1,
    url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
    is_main: true,
    variant: mockVariants[0],
  },
  {
    id: 2,
    variant_id: 1,
    url: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300&h=300&fit=crop',
    is_main: false,
    variant: mockVariants[0],
  },
  {
    id: 3,
    variant_id: 3,
    url: 'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=300&h=300&fit=crop',
    is_main: true,
    variant: mockVariants[2],
  },
  {
    id: 4,
    variant_id: 4,
    url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop',
    is_main: true,
    variant: mockVariants[3],
  },
  {
    id: 5,
    variant_id: 5,
    url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop',
    is_main: true,
    variant: mockVariants[4],
  },
];

// Вспомогательные функции для получения данных
export const getCategoryById = (id: number): ProductCategory | undefined => {
  return mockCategories.find(category => category.id === id);
};

export const getProductById = (id: number): Product | undefined => {
  return mockProducts.find(product => product.id === id);
};

export const getVariantsByProductId = (productId: number): ProductVariant[] => {
  return mockVariants.filter(variant => variant.product_id === productId);
};

export const getImagesByVariantId = (variantId: number): ProductImage[] => {
  return mockImages.filter(image => image.variant_id === variantId);
};

export const getProductsWithCategories = (): (Product & { category: ProductCategory })[] => {
  return mockProducts.map(product => ({
    ...product,
    category: mockCategories.find(cat => cat.id === product.category_id)!
  }));
};

export const getVariantsWithProducts = (): (ProductVariant & { product: Product })[] => {
  return mockVariants.map(variant => ({
    ...variant,
    product: mockProducts.find(prod => prod.id === variant.product_id)!
  }));
};

export const getImagesWithVariants = (): (ProductImage & { variant: ProductVariant & { product: Product } })[] => {
  return mockImages.map(image => ({
      ...image,
      variant: {
      ...mockVariants.find(variant => variant.id === image.variant_id)!,
      product: mockProducts.find(prod => prod.id === mockVariants.find(variant => variant.id === image.variant_id)!.product_id)!
    }
  }));
};
