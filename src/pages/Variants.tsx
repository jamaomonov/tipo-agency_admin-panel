import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { LoadingState } from '@/components/ui/loading-state';
import { ApiError } from '@/components/ui/api-error';
import { useApi } from '@/hooks/use-api';
import { variantsApi } from '@/services/variants-api';
import { productsApi } from '@/services/products-api';
import type { ProductVariantFormData, Product, ProductVariantWithDetails } from '@/types';
import { Plus, Edit, Trash2, Search, Palette, AlertTriangle, Loader2 } from 'lucide-react';

export function Variants() {
  const [variants, setVariants] = useState<ProductVariantWithDetails[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariantWithDetails | null>(null);
  const [formData, setFormData] = useState<ProductVariantFormData>({
    product_id: 0,
    price: 0,
    stock_quantity: 0,
    color: '',
    size: '',
    material: '',
  });

  const navigate = useNavigate();

  // API хуки
  const [getVariantsState, getVariantsActions] = useApi(variantsApi.getAllWithDetails.bind(variantsApi));
  const [getProductsState, getProductsActions] = useApi(productsApi.getAll.bind(productsApi));
  const [createVariantState, createVariantActions] = useApi(variantsApi.create.bind(variantsApi));
  const [updateVariantState, updateVariantActions] = useApi(variantsApi.update.bind(variantsApi));
  const [deleteVariantState, deleteVariantActions] = useApi(variantsApi.delete.bind(variantsApi));

  // Загрузка данных при монтировании
  useEffect(() => {
    loadData();
  }, []);

  // Обновление локального состояния при получении данных
  useEffect(() => {
    if (getVariantsState.data) {
      setVariants(getVariantsState.data);
    }
  }, [getVariantsState.data]);

  useEffect(() => {
    if (getProductsState.data) {
      setProducts(getProductsState.data);
    }
  }, [getProductsState.data]);

  const loadData = async () => {
    try {
      await Promise.all([
        getVariantsActions.execute(),
        getProductsActions.execute(),
      ]);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  const filteredVariants = variants.filter(variant => {
    const matchesSearch =
      variant.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variant.price.toString().includes(searchTerm) ||
      (variant.color && variant.color.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (variant.size && variant.size.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (variant.material && variant.material.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesProduct = productFilter === 'all' || (variant.product_id && variant.product_id.toString() === productFilter);

    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = variant.stock_quantity > 0 && variant.stock_quantity < 10;
    } else if (stockFilter === 'out') {
      matchesStock = variant.stock_quantity === 0;
    } else if (stockFilter === 'in-stock') {
      matchesStock = variant.stock_quantity >= 10;
    }

    return matchesSearch && matchesProduct && matchesStock;
  });

  const handleCreate = async () => {
    try {
      const newVariant = await createVariantActions.execute(formData);
      // Преобразуем ProductVariant в ProductVariantWithDetails
      const variantWithDetails: ProductVariantWithDetails = {
        ...newVariant,
        product: products.find(p => p.id === newVariant.product_id)!,
        images: []
      };
      setVariants([...variants, variantWithDetails]);
      setFormData({
        product_id: 0,
        price: 0,
        stock_quantity: 0,
        color: '',
        size: '',
        material: '',
      });
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Ошибка создания варианта:', error);
    }
  };

  const handleEdit = (variant: ProductVariantWithDetails) => {
    setEditingVariant(variant);
    setFormData({
      product_id: variant.product_id,
      price: variant.price,
      stock_quantity: variant.stock_quantity,
      color: variant.color || '',
      size: variant.size || '',
      material: variant.material || '',
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingVariant) return;

    try {
      const updatedVariant = await updateVariantActions.execute(editingVariant.id, formData);
      // Преобразуем ProductVariant в ProductVariantWithDetails
      const variantWithDetails: ProductVariantWithDetails = {
        ...updatedVariant,
        product: products.find(p => p.id === updatedVariant.product_id)!,
        images: editingVariant.images || []
      };
      setVariants(variants.map(variant =>
        variant.id === editingVariant.id ? variantWithDetails : variant
      ));
      setFormData({
        product_id: 0,
        price: 0,
        stock_quantity: 0,
        color: '',
        size: '',
        material: '',
      });
      setEditingVariant(null);
      setIsEditOpen(false);
    } catch (error) {
      console.error('Ошибка обновления варианта:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteVariantActions.execute(id);
    setVariants(variants.filter(variant => variant.id !== id));
    } catch (error) {
      console.error('Ошибка удаления варианта:', error);
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge className="bg-red-100 text-red-800">Нет в наличии</Badge>;
    } else if (stock < 10) {
      return <Badge className="bg-orange-100 text-orange-800">Мало</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">В наличии</Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'UZS',
    }).format(price);
  };

  const handleShowImages = (variantId: number) => {
    navigate(`/images?variant_id=${variantId}`);
  };

  const VariantForm = ({ isEdit = false }: { isEdit?: boolean }) => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product">Товар</Label>
          <Select
            value={formData.product_id ? formData.product_id.toString() : ''}
            onValueChange={(value) => setFormData({ ...formData, product_id: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите товар" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="color">Цвет</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="Белый, Черный..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Размер</Label>
            <Input
              id="size"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              placeholder="S, M, L, XL или 42, 43..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="material">Материал</Label>
          <Input
            id="material"
            value={formData.material}
            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
            placeholder="Хлопок 100%, Кожа/Текстиль..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Цена (UZS)</Label>
          <Input
            id="price"
              type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
            placeholder="0"
              min="0"
            step="1000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Количество на складе</Label>
            <Input
              id="stock"
              type="number"
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
              placeholder="0"
              min="0"
            />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setFormData({ product_id: 0, price: 0, stock_quantity: 0, color: '', size: '', material: '' });
              isEdit ? setIsEditOpen(false) : setIsCreateOpen(false);
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={isEdit ? handleUpdate : handleCreate}
            disabled={createVariantState.loading || updateVariantState.loading}
          >
            {(createVariantState.loading || updateVariantState.loading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEdit ? 'Обновить' : 'Создать'}
          </Button>
        </div>
      </div>
    );
  };

  if (getVariantsState.loading || getProductsState.loading) {
    return <LoadingState message="Загрузка данных..." />;
  }

  if (getVariantsState.error || getProductsState.error) {
    return (
      <ApiError 
        error={getVariantsState.error || getProductsState.error!} 
        onRetry={loadData}
        title="Ошибка загрузки данных"
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Palette className="h-8 w-8 text-blue-600" />
            <span>Варианты товаров</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Управление вариантами товаров и их характеристиками
          </p>
        </div>

        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Добавить вариант
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Создать вариант товара</SheetTitle>
              <SheetDescription>
                Заполните информацию для нового варианта товара
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <VariantForm />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего вариантов</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{variants.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">В наличии</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {variants.filter(v => v.stock_quantity > 0).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Мало товара</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {variants.filter(v => v.stock_quantity > 0 && v.stock_quantity < 10).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нет в наличии</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {variants.filter(v => v.stock_quantity === 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Поиск и фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Поиск по товару, цене, цвету, размеру, материалу..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

              <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Все товары" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все товары</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Все варианты" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">Все варианты</SelectItem>
                  <SelectItem value="in-stock">В наличии</SelectItem>
                <SelectItem value="low">Мало товара</SelectItem>
                  <SelectItem value="out">Нет в наличии</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </CardContent>
      </Card>

      {/* Variants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Список вариантов</CardTitle>
          <CardDescription>
            Все варианты товаров в системе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Товар</TableHead>
                <TableHead>Цвет</TableHead>
                <TableHead>Размер</TableHead>
                <TableHead>Материал</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Остаток</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Изображения</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVariants.map((variant) => (
                  <TableRow key={variant.id}>
                  <TableCell className="font-medium">{variant.id}</TableCell>
                    <TableCell>
                    <div>
                      <div className="font-medium">{variant.product?.name || '-'}</div>
                      <div className="text-sm text-gray-500">
                        ID товара: {variant.product_id}
                          </div>
                      </div>
                    </TableCell>
                    <TableCell>
                    {variant.color || '-'}
                    </TableCell>
                    <TableCell>
                    {variant.size || '-'}
                    </TableCell>
                    <TableCell>
                    <div className="max-w-xs truncate" title={variant.material}>
                      {variant.material || '-'}
                    </div>
                    </TableCell>
                    <TableCell className="font-medium">
                    {formatPrice(variant.price)}
                    </TableCell>
                    <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{variant.stock_quantity}</span>
                      {variant.stock_quantity === 0 && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      </div>
                    </TableCell>
                    <TableCell>
                    {getStockBadge(variant.stock_quantity)}
                    </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-start space-x-2">
                      <Badge variant="secondary">{variant.images?.length || 0} шт.</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                        onClick={() => handleShowImages(variant.id)}
                        disabled={(variant.images?.length || 0) === 0}
                        >
                        Показать
                        </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(variant)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>Редактировать вариант</SheetTitle>
                            <SheetDescription>
                              Измените информацию о варианте товара
                            </SheetDescription>
                          </SheetHeader>
                          <div className="mt-6">
                            <VariantForm isEdit />
                          </div>
                        </SheetContent>
                      </Sheet>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Удалить вариант</AlertDialogTitle>
                              <AlertDialogDescription>
                              Вы уверены, что хотите удалить этот вариант товара? 
                              Это действие нельзя отменить.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(variant.id)}
                                className="bg-red-600 hover:bg-red-700"
                              disabled={deleteVariantState.loading}
                              >
                              {deleteVariantState.loading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
