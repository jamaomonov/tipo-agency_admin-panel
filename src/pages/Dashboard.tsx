import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/ui/loading-state';
import { ApiError } from '@/components/ui/api-error';
import { useApi } from '@/hooks/use-api';
import { productsApi } from '@/services/products-api';
import { variantsApi } from '@/services/variants-api';
import { categoriesApi } from '@/services/categories-api';
import { imagesApi } from '@/services/images-api';
import type { Product, ProductVariantWithDetails } from '@/types';
import { 
  Package, 
  Palette, 
  FolderOpen, 
  Image as ImageIcon, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Plus,
  Eye,
  Edit
} from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalVariants: number;
  totalCategories: number;
  totalImages: number;
  activeProducts: number;
  lowStockVariants: number;
  outOfStockVariants: number;
  productsWithVariants: number;
  variantsWithImages: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalVariants: 0,
    totalCategories: 0,
    totalImages: 0,
    activeProducts: 0,
    lowStockVariants: 0,
    outOfStockVariants: 0,
    productsWithVariants: 0,
    variantsWithImages: 0,
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recentVariants, setRecentVariants] = useState<ProductVariantWithDetails[]>([]);

  // API хуки
  const [getProductsState, getProductsActions] = useApi(productsApi.getAll.bind(productsApi));
  const [getVariantsState, getVariantsActions] = useApi(variantsApi.getAllWithDetails.bind(variantsApi));
  const [getCategoriesState, getCategoriesActions] = useApi(categoriesApi.getAll.bind(categoriesApi));
  const [getImagesState, getImagesActions] = useApi(imagesApi.getAll.bind(imagesApi));

  // Загрузка данных при монтировании
  useEffect(() => {
    loadData();
  }, []);

  // Обновление статистики при получении данных
  useEffect(() => {
    if (getProductsState.data && getVariantsState.data && getCategoriesState.data && getImagesState.data) {
      calculateStats();
    }
  }, [getProductsState.data, getVariantsState.data, getCategoriesState.data, getImagesState.data]);

  const loadData = async () => {
    try {
      await Promise.all([
        getProductsActions.execute(),
        getVariantsActions.execute(),
        getCategoriesActions.execute(),
        getImagesActions.execute(),
      ]);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  const calculateStats = () => {
    const products = getProductsState.data || [];
    const variants = getVariantsState.data || [];
    const categories = getCategoriesState.data || [];
    const images = getImagesState.data || [];

    const activeProducts = products.filter(p => p.is_active).length;
    const lowStockVariants = variants.filter(v => v.stock_quantity > 0 && v.stock_quantity < 10).length;
    const outOfStockVariants = variants.filter(v => v.stock_quantity === 0).length;
    const productsWithVariants = products.filter(p => 
      variants.some(v => v.product_id === p.id)
    ).length;
    const variantsWithImages = variants.filter(v => 
      images.some(img => img.variant_id === v.id)
    ).length;

    setStats({
      totalProducts: products.length,
      totalVariants: variants.length,
      totalCategories: categories.length,
      totalImages: images.length,
      activeProducts,
      lowStockVariants,
      outOfStockVariants,
      productsWithVariants,
      variantsWithImages,
    });

    // Устанавливаем недавние элементы (последние 5)
    setRecentProducts(products.slice(-5).reverse());
    setRecentVariants(variants.slice(-5).reverse());
  };

  const isLoading = getProductsState.loading || getVariantsState.loading || getCategoriesState.loading || getImagesState.loading;
  const error = getProductsState.error || getVariantsState.error || getCategoriesState.error || getImagesState.error;

  if (isLoading && stats.totalProducts === 0) {
    return <LoadingState message="Загрузка статистики..." />;
  }

  if (error) {
    return <ApiError error={error} onRetry={loadData} />;
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Панель управления</h1>
          <p className="text-gray-600 text-sm lg:text-base">Обзор и управление товарами, вариантами и изображениями</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button asChild className="w-full sm:w-auto">
            <Link to="/products">
              <Plus className="mr-2 h-4 w-4" />
              Добавить товар
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link to="/variants">
              <Palette className="mr-2 h-4 w-4" />
              Добавить вариант
            </Link>
          </Button>
        </div>
      </div>

      {/* Основная статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего товаров</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProducts} активных
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Вариантов товаров</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVariants}</div>
            <p className="text-xs text-muted-foreground">
              {stats.variantsWithImages} с изображениями
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Категорий</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              {stats.productsWithVariants} товаров с вариантами
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Изображений</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalImages}</div>
            <p className="text-xs text-muted-foreground">
              Среднее: {stats.totalVariants > 0 ? Math.round(stats.totalImages / stats.totalVariants) : 0} на вариант
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Предупреждения и уведомления */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className={stats.outOfStockVariants > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нет в наличии</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${stats.outOfStockVariants > 0 ? "text-red-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.outOfStockVariants > 0 ? "text-red-600" : ""}`}>
              {stats.outOfStockVariants}
            </div>
            <p className="text-xs text-muted-foreground">
              вариантов товаров
            </p>
          </CardContent>
        </Card>

        <Card className={stats.lowStockVariants > 0 ? "border-orange-200 bg-orange-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Мало товара</CardTitle>
            <TrendingUp className={`h-4 w-4 ${stats.lowStockVariants > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.lowStockVariants > 0 ? "text-orange-600" : ""}`}>
              {stats.lowStockVariants}
            </div>
            <p className="text-xs text-muted-foreground">
              вариантов (1-9 шт.)
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Статус системы</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalProducts > 0 ? "Активна" : "Пуста"}
            </div>
            <p className="text-xs text-muted-foreground">
              Все системы работают
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Недавние товары и варианты */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Недавние товары */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <span>Недавние товары</span>
              <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                <Link to="/products">
                  <Eye className="mr-2 h-4 w-4" />
                  Все товары
                </Link>
              </Button>
            </CardTitle>
            <CardDescription>
              Последние добавленные товары
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentProducts.length > 0 ? (
              <div className="space-y-3">
                {recentProducts.map((product) => (
                  <div key={product.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-gray-500 truncate">{product.category?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs">
                        {product.is_active ? "Активен" : "Неактивен"}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/products/${product.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="mx-auto h-8 w-8 mb-2" />
                <p>Товары не найдены</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link to="/products">Добавить первый товар</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Недавние варианты */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <span>Недавние варианты</span>
              <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                <Link to="/variants">
                  <Eye className="mr-2 h-4 w-4" />
                  Все варианты
                </Link>
              </Button>
            </CardTitle>
            <CardDescription>
              Последние добавленные варианты товаров
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentVariants.length > 0 ? (
              <div className="space-y-3">
                {recentVariants.map((variant) => (
                  <div key={variant.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <Palette className="h-5 w-5 text-purple-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{variant.product?.name}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {variant.color || 'Без цвета'} {variant.size || 'Без размера'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={variant.stock_quantity > 0 ? "default" : "destructive"} className="text-xs">
                        {variant.stock_quantity} шт.
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/variants">
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Palette className="mx-auto h-8 w-8 mb-2" />
                <p>Варианты не найдены</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link to="/variants">Добавить первый вариант</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Быстрые действия */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
          <CardDescription>
            Часто используемые функции для быстрого доступа
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/products">
                <Package className="h-6 w-6 mb-2" />
                <span className="text-sm">Управление товарами</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/variants">
                <Palette className="h-6 w-6 mb-2" />
                <span className="text-sm">Управление вариантами</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/categories">
                <FolderOpen className="h-6 w-6 mb-2" />
                <span className="text-sm">Управление категориями</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to="/images">
                <ImageIcon className="h-6 w-6 mb-2" />
                <span className="text-sm">Управление изображениями</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
