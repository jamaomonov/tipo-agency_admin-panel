import type { Category, Product, ProductVariant, ProductImage } from '@/types';

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Одежда',
    description: 'Мужская и женская одежда',
    slug: 'clothes',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Обувь',
    description: 'Спортивная и повседневная обувь',
    slug: 'shoes',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: '3',
    name: 'Аксессуары',
    description: 'Сумки, часы, украшения',
    slug: 'accessories',
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
  },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Футболка Premium',
    description: 'Высококачественная хлопковая футболка с современным дизайном',
    price: 2500,
    categoryId: '1',
    sku: 'TSHIRT-001',
    status: 'active',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    name: 'Кроссовки Спорт',
    description: 'Удобные кроссовки для занятий спортом и повседневной носки',
    price: 8500,
    categoryId: '2',
    sku: 'SNEAKERS-001',
    status: 'active',
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21'),
  },
  {
    id: '3',
    name: 'Рюкзак Городской',
    description: 'Стильный рюкзак для работы и путешествий',
    price: 4500,
    categoryId: '3',
    sku: 'BACKPACK-001',
    status: 'draft',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
  },
];

export const mockVariants: ProductVariant[] = [
  {
    id: '1',
    productId: '1',
    name: 'Футболка Premium - Белая M',
    color: 'Белый',
    size: 'M',
    material: 'Хлопок 100%',
    sku: 'TSHIRT-001-WHITE-M',
    stock: 25,
    status: 'active',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    productId: '1',
    name: 'Футболка Premium - Белая L',
    color: 'Белый',
    size: 'L',
    material: 'Хлопок 100%',
    sku: 'TSHIRT-001-WHITE-L',
    stock: 18,
    status: 'active',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    productId: '1',
    name: 'Футболка Premium - Черная M',
    color: 'Черный',
    size: 'M',
    material: 'Хлопок 100%',
    sku: 'TSHIRT-001-BLACK-M',
    stock: 30,
    status: 'active',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '4',
    productId: '2',
    name: 'Кроссовки Спорт - Белые 42',
    color: 'Белый',
    size: '42',
    material: 'Кожа/Текстиль',
    sku: 'SNEAKERS-001-WHITE-42',
    stock: 12,
    status: 'active',
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21'),
  },
  {
    id: '5',
    productId: '2',
    name: 'Кроссовки Спорт - Черные 43',
    color: 'Черный',
    size: '43',
    material: 'Кожа/Текстиль',
    sku: 'SNEAKERS-001-BLACK-43',
    stock: 8,
    status: 'active',
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21'),
  },
  {
    id: '6',
    productId: '3',
    name: 'Рюкзак Городской - Черный',
    color: 'Черный',
    material: 'Нейлон',
    sku: 'BACKPACK-001-BLACK',
    stock: 0,
    status: 'inactive',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
  },
];

export const mockImages: ProductImage[] = [
  {
    id: '1',
    variantId: '1',
    url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
    filename: 'tshirt-white-m-1.jpg',
    size: 156789,
    mimeType: 'image/jpeg',
    isMain: true,
    order: 1,
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    variantId: '1',
    url: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300&h=300&fit=crop',
    filename: 'tshirt-white-m-2.jpg',
    size: 178234,
    mimeType: 'image/jpeg',
    isMain: false,
    order: 2,
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    variantId: '3',
    url: 'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=300&h=300&fit=crop',
    filename: 'tshirt-black-m-1.jpg',
    size: 165432,
    mimeType: 'image/jpeg',
    isMain: true,
    order: 1,
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '4',
    variantId: '4',
    url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop',
    filename: 'sneakers-white-42-1.jpg',
    size: 234567,
    mimeType: 'image/jpeg',
    isMain: true,
    order: 1,
    createdAt: new Date('2024-01-21'),
  },
  {
    id: '5',
    variantId: '5',
    url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop',
    filename: 'sneakers-black-43-1.jpg',
    size: 198765,
    mimeType: 'image/jpeg',
    isMain: true,
    order: 1,
    createdAt: new Date('2024-01-21'),
  },
];

// Функции для получения связанных данных
export const getCategoryById = (id: string): Category | undefined => {
  return mockCategories.find(cat => cat.id === id);
};

export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(product => product.id === id);
};

export const getVariantsByProductId = (productId: string): ProductVariant[] => {
  return mockVariants.filter(variant => variant.productId === productId);
};

export const getImagesByVariantId = (variantId: string): ProductImage[] => {
  return mockImages.filter(image => image.variantId === variantId);
};

export const getProductsWithCategories = (): (Product & { category: Category })[] => {
  return mockProducts.map(product => ({
    ...product,
    category: getCategoryById(product.categoryId)!,
  }));
};

export const getVariantsWithProducts = (): (ProductVariant & { product: Product })[] => {
  return mockVariants.map(variant => ({
    ...variant,
    product: getProductById(variant.productId)!,
  }));
};

export const getImagesWithVariants = (): (ProductImage & { variant: ProductVariant & { product: Product } })[] => {
  return mockImages.map(image => {
    const variant = mockVariants.find(v => v.id === image.variantId)!;
    const product = getProductById(variant.productId)!;
    return {
      ...image,
      variant: {
        ...variant,
        product,
      },
    };
  });
};
