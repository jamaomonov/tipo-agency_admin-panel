# Интеграция с API

## Обзор

Админ-панель полностью интегрирована с REST API для управления данными интернет-магазина. Все операции CRUD выполняются через API запросы.

## Конфигурация

### Базовые настройки

Файл: `src/config/api.ts`

```typescript
export const API_CONFIG = {
  base_url: 'http://localhost:8000', // Базовый URL API сервера
  admin_prefix: '/admin',            // Префикс для админ-панели
  timeout: 10000,                    // Таймаут запросов (мс)
  headers: {
    'Content-Type': 'application/json',
  },
} as const;
```

### Эндпоинты

```typescript
export const API_ENDPOINTS = {
  // Категории
  categories: '/api/v1/categories/',
  category: (id: number) => `/api/v1/categories/${id}`,
  
  // Товары
  products: '/api/v1/products/',
  product: (id: number) => `/api/v1/products/${id}`,
  
  // Варианты
  variants: '/api/v1/variants/',
  variant: (id: number) => `/api/v1/variants/${id}`,
  
  // Изображения
  images: '/api/v1/images/',
  image: (id: number) => `/api/v1/images/${id}`,
} as const;
```

## HTTP Клиент

### Основной клиент

Файл: `src/lib/api-client.ts`

```typescript
class ApiClient {
  async request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, data?: any): Promise<ApiResponse<T>>
  async get<T>(endpoint: string): Promise<ApiResponse<T>>
  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>>
  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>>
  async delete<T>(endpoint: string): Promise<ApiResponse<T>>
}
```

### Обработка ошибок

```typescript
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
```

## Сервисы API

### Категории

Файл: `src/services/categories-api.ts`

```typescript
export class CategoriesApiService {
  async getAll(): Promise<ProductCategory[]>
  async getById(id: number): Promise<ProductCategory>
  async create(data: CategoryFormData): Promise<ProductCategory>
  async update(id: number, data: CategoryFormData): Promise<ProductCategory>
  async delete(id: number): Promise<void>
}
```

### Товары

Файл: `src/services/products-api.ts`

```typescript
export class ProductsApiService {
  async getAll(): Promise<Product[]>
  async getById(id: number): Promise<Product>
  async create(data: ProductFormData): Promise<Product>
  async update(id: number, data: ProductFormData): Promise<Product>
  async delete(id: number): Promise<void>
}
```

### Варианты

Файл: `src/services/variants-api.ts`

```typescript
export class VariantsApiService {
  async getAll(): Promise<ProductVariant[]>
  async getAllWithDetails(): Promise<ProductVariantWithDetails[]>
  async getById(id: number): Promise<ProductVariant>
  async create(data: ProductVariantFormData): Promise<ProductVariant>
  async update(id: number, data: ProductVariantFormData): Promise<ProductVariant>
  async delete(id: number): Promise<void>
}
```

### Изображения

Файл: `src/services/images-api.ts`

```typescript
export class ImagesApiService {
  async getAll(): Promise<ProductImage[]>
  async getById(id: number): Promise<ProductImage>
  async create(data: ProductImageFormData): Promise<ProductImage>
  async setMain(id: number): Promise<void>
  async delete(id: number): Promise<void>
}
```

## Хук useApi

### Использование

```typescript
const [state, actions] = useApi(apiFunction);

// Состояние
state.data      // Данные ответа
state.loading   // Статус загрузки
state.error     // Ошибка

// Действия
actions.execute(...args)  // Выполнить запрос
actions.reset()           // Сбросить состояние
actions.setData(data)     // Установить данные
```

### Пример

```typescript
const [productsState, productsActions] = useApi(productsApi.getAll.bind(productsApi));

useEffect(() => {
  productsActions.execute();
}, []);

if (productsState.loading) return <LoadingState />;
if (productsState.error) return <ApiError error={productsState.error} />;

return <div>{productsState.data?.map(...)}</div>;
```

## Типы данных

### Основные типы

```typescript
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
```

### Типы форм

```typescript
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
```

## Загрузка файлов

### FormData для изображений

```typescript
const formData = new FormData();
formData.append('variant_id', variantId.toString());
formData.append('is_main', isMain.toString());
formData.append('file', file);

const response = await imagesApi.create(formData);
```

### Поддерживаемые форматы

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### Ограничения

- Максимальный размер файла: 5MB
- Максимальное количество файлов: 5

## Обработка ошибок

### Компонент ApiError

```typescript
<ApiError 
  error={apiError} 
  onRetry={() => retryFunction()} 
  title="Ошибка загрузки данных"
/>
```

### Типы ошибок

```typescript
// Сетевые ошибки
{
  message: "Превышено время ожидания запроса",
  status: 408
}

// Ошибки валидации
{
  message: "Ошибка валидации",
  status: 422,
  errors: {
    "name": ["Поле обязательно для заполнения"],
    "price": ["Цена должна быть положительной"]
  }
}

// Серверные ошибки
{
  message: "Внутренняя ошибка сервера",
  status: 500
}
```

## Кэширование и оптимизация

### Перезагрузка данных

```typescript
const loadData = () => {
  getProductsActions.execute();
  getCategoriesActions.execute();
};

// После создания/обновления/удаления
await createProductActions.execute(formData);
loadData(); // Перезагрузить все данные
```

### Оптимистичные обновления

```typescript
// Добавить новый товар в список сразу
const newProduct = await createProductActions.execute(formData);
setProducts([...products, newProduct]);
```

## Аутентификация (готово к интеграции)

### Добавление токенов

```typescript
// В api-client.ts
const options: RequestInit = {
  method,
  headers: { 
    ...API_CONFIG.headers,
    'Authorization': `Bearer ${getToken()}` // Добавить токен
  },
  signal: AbortSignal.timeout(API_CONFIG.timeout),
};
```

### Обработка 401 ошибок

```typescript
if (response.status === 401) {
  // Перенаправить на страницу входа
  window.location.href = '/login';
}
```

## Тестирование API

### Моковые данные

Файл: `src/data/mockData.ts`

```typescript
export const mockCategories: ProductCategory[] = [...];
export const mockProducts: Product[] = [...];
export const mockVariants: ProductVariant[] = [...];
export const mockImages: ProductImage[] = [...];
```

### Переключение между моковыми данными и API

```typescript
const USE_MOCK_DATA = process.env.NODE_ENV === 'development';

if (USE_MOCK_DATA) {
  return mockProducts;
} else {
  return await productsApi.getAll();
}
```

## Мониторинг и логирование

### Логирование запросов

```typescript
// В api-client.ts
console.log(`[API] ${method} ${endpoint}`, data);
```

### Метрики производительности

```typescript
const startTime = Date.now();
const response = await fetch(url, options);
const duration = Date.now() - startTime;

console.log(`[API] ${method} ${endpoint} - ${duration}ms`);
```

## Безопасность

### Валидация данных

```typescript
// На клиенте
if (!formData.name.trim()) {
  throw new Error('Название обязательно');
}

if (formData.price <= 0) {
  throw new Error('Цена должна быть положительной');
}
```

### Санитизация

```typescript
// Очистка HTML тегов
const sanitizeHtml = (html: string) => {
  return html.replace(/<[^>]*>/g, '');
};
```

## Примеры использования

### Получение списка товаров с категориями

```typescript
const [products, setProducts] = useState<Product[]>([]);

useEffect(() => {
  const loadProducts = async () => {
    try {
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    }
  };
  
  loadProducts();
}, []);
```

### Создание нового товара

```typescript
const handleCreate = async (formData: ProductFormData) => {
  try {
    const newProduct = await productsApi.create(formData);
    setProducts([...products, newProduct]);
    setIsCreateOpen(false);
  } catch (error) {
    console.error('Ошибка создания товара:', error);
  }
};
```

### Загрузка изображения

```typescript
const handleImageUpload = async (file: File, variantId: number) => {
  const formData = new FormData();
  formData.append('variant_id', variantId.toString());
  formData.append('is_main', 'false');
  formData.append('file', file);

  try {
    const newImage = await imagesApi.create(formData);
    // Обновить список изображений
  } catch (error) {
    console.error('Ошибка загрузки изображения:', error);
  }
};
```

## Заключение

API интеграция полностью настроена и готова к использованию. Все основные операции CRUD реализованы с правильной обработкой ошибок и состояний загрузки. Система легко расширяется для добавления новых эндпоинтов и функциональности. 