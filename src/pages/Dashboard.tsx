import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/ui/loading-state';
import { ApiError } from '@/components/ui/api-error';
import { useApi } from '@/hooks/use-api';
import { categoriesApi } from '@/services/categories-api';
import { productsApi } from '@/services/products-api';
import { variantsApi } from '@/services/variants-api';
import { imagesApi } from '@/services/images-api';
import { Package, Tags, Palette, Images, TrendingUp, AlertTriangle } from 'lucide-react';

interface DashboardStats {
  categories: number;
  products: number;
  variants: number;
  images: number;
  activeProducts: number;
  draftProducts: number;
  lowStockVariants: number;
  outOfStockVariants: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    categories: 0,
    products: 0,
    variants: 0,
    images: 0,
    activeProducts: 0,
    draftProducts: 0,
    lowStockVariants: 0,
    outOfStockVariants: 0,
  });

  const [categoriesState, categoriesActions] = useApi(categoriesApi.getAll.bind(categoriesApi));
  const [productsState, productsActions] = useApi(productsApi.getAll.bind(productsApi));
  const [variantsState, variantsActions] = useApi(variantsApi.getAll.bind(variantsApi));
  const [imagesState, imagesActions] = useApi(imagesApi.getAll.bind(imagesApi));

  const loadData = async () => {
    try {
      const [categories, products, variants, images] = await Promise.all([
        categoriesActions.execute(),
        productsActions.execute(),
        variantsActions.execute(),
        imagesActions.execute(),
      ]);

      setStats({
        categories: categories.length,
        products: products.length,
        variants: variants.length,
        images: images.length,
        activeProducts: products.filter((p: any) => p.is_active).length,
        draftProducts: products.filter((p: any) => !p.is_active).length,
        lowStockVariants: variants.filter((v: any) => v.stock_quantity < 10 && v.stock_quantity > 0).length,
        outOfStockVariants: variants.filter((v: any) => v.stock_quantity === 0).length,
      });
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isLoading = categoriesState.loading || productsState.loading || variantsState.loading || imagesState.loading;
  const hasError = categoriesState.error || productsState.error || variantsState.error || imagesState.error;

  if (isLoading && stats.categories === 0) {
    return <LoadingState message="Загрузка статистики..." />;
  }

  if (hasError) {
    return <ApiError error={hasError} onRetry={loadData} />;
  }

  const quickStats = [
    {
      title: 'Категории',
      value: stats.categories,
      icon: Tags,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Товары',
      value: stats.products,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Варианты',
      value: stats.variants,
      icon: Palette,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Изображения',
      value: stats.images,
      icon: Images,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Панель управления
          </h1>
          <p className="text-gray-600 mt-1">
            Добро пожаловать в админку интернет-магазина
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-700 border-green-200">
            <TrendingUp className="mr-1 h-3 w-3" />
            Система активна
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-green-600" />
              <span>Статус товаров</span>
            </CardTitle>
            <CardDescription>
              Распределение товаров по статусам
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-700">Активные</span>
              </div>
              <Badge variant="secondary">{stats.activeProducts}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-sm text-gray-700">Черновики</span>
              </div>
              <Badge variant="secondary">{stats.draftProducts}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Остатки на складе</span>
            </CardTitle>
            <CardDescription>
              Товары с низкими остатками
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <span className="text-sm text-gray-700">Мало на складе (&lt;10)</span>
              </div>
              <Badge variant="secondary" className="text-orange-700 bg-orange-50">
                {stats.lowStockVariants}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm text-gray-700">Нет в наличии</span>
              </div>
              <Badge variant="secondary" className="text-red-700 bg-red-50">
                {stats.outOfStockVariants}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Последние изменения</CardTitle>
          <CardDescription>
            Последние обновления в системе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-gray-700">Добавлен товар "Футболка Premium"</span>
              </div>
              <span className="text-gray-500">2 часа назад</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-gray-700">Обновлена категория "Обувь"</span>
              </div>
              <span className="text-gray-500">4 часа назад</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="text-gray-700">Загружены изображения для кроссовок</span>
              </div>
              <span className="text-gray-500">6 часов назад</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
