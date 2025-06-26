import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Edit, Trash2, Palette, Image as ImageIcon } from 'lucide-react';
import { variantFormToCreate, variantFormToUpdate, formatPrice, validatePrice, validateStockQuantity, getFieldError, hasFieldError } from '@/lib/utils';

// Компонент формы для создания/редактирования вариантов
const VariantForm = ({ 
  formData, 
  setFormData, 
  products, 
  onSubmit, 
  onCancel,
  isLoading, 
  errors = {}, 
  isEdit = false 
}: {
  formData: ProductVariantFormData;
  setFormData: (data: ProductVariantFormData | ((prev: ProductVariantFormData) => ProductVariantFormData)) => void;
  products: Product[];
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  errors?: Record<string, string>;
  isEdit?: boolean;
}) => {
  // Мемоизированные обработчики для предотвращения потери фокуса
  const handleProductChange = useCallback((value: string) => {
    setFormData(prev => ({...prev, product_id: parseInt(value)}));
  }, []);

  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({...prev, price: parseFloat(e.target.value) || 0}));
  }, []);

  const handleStockChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({...prev, stock_quantity: parseInt(e.target.value) || 0}));
  }, []);

  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({...prev, color: e.target.value}));
  }, []);

  const handleSizeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({...prev, size: e.target.value}));
  }, []);

  const handleMaterialChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({...prev, material: e.target.value}));
  }, []);

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
        <Label htmlFor="product" className="text-left">Товар</Label>
        <div className="sm:col-span-3">
          <Select
            value={formData.product_id ? formData.product_id.toString() : ''}
            onValueChange={handleProductChange}
          >
            <SelectTrigger className={hasFieldError('product_id', errors) ? 'border-red-500' : ''}>
              <SelectValue placeholder="Выберите товар" />
            </SelectTrigger>
            <SelectContent>
              {products.map(product => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getFieldError('product_id', errors) && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('product_id', errors)}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
        <Label htmlFor="price" className="text-left">Цена</Label>
        <div className="sm:col-span-3">
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={handlePriceChange}
            className={hasFieldError('price', errors) ? 'border-red-500' : ''}
          />
          {getFieldError('price', errors) && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('price', errors)}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
        <Label htmlFor="stock" className="text-left">Количество на складе</Label>
        <div className="sm:col-span-3">
          <Input
            id="stock"
            type="number"
            value={formData.stock_quantity}
            onChange={handleStockChange}
            className={hasFieldError('stock_quantity', errors) ? 'border-red-500' : ''}
          />
          {getFieldError('stock_quantity', errors) && (
            <p className="text-red-500 text-sm mt-1">{getFieldError('stock_quantity', errors)}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
        <Label htmlFor="color" className="text-left">Цвет</Label>
        <div className="sm:col-span-3">
          <Input
            id="color"
            value={formData.color}
            onChange={handleColorChange}
            placeholder="Красный"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
        <Label htmlFor="size" className="text-left">Размер</Label>
        <div className="sm:col-span-3">
          <Input
            id="size"
            value={formData.size}
            onChange={handleSizeChange}
            placeholder="M"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
        <Label htmlFor="material" className="text-left">Материал</Label>
        <div className="sm:col-span-3">
          <Input
            id="material"
            value={formData.material}
            onChange={handleMaterialChange}
            placeholder="Хлопок"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Отмена
        </Button>
        <Button onClick={onSubmit} disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? 'Сохранение...' : (isEdit ? 'Сохранить изменения' : 'Создать вариант')}
        </Button>
      </div>
    </div>
  );
};

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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    
    if (formData.product_id === 0) {
      errors.product_id = 'Выберите товар';
    }
    
    if (!validatePrice(formData.price)) {
      errors.price = 'Цена должна быть больше 0 и меньше 1,000,000';
    }
    
    if (!validateStockQuantity(formData.stock_quantity)) {
      errors.stock_quantity = 'Количество должно быть от 0 до 100,000';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleCreate = useCallback(async () => {
    if (!validateForm()) return;
    
    try {
      const createData = variantFormToCreate(formData);
      const newVariant = await createVariantActions.execute(createData);
      // Преобразуем ProductVariant в ProductVariantWithDetails
      const variantWithDetails: ProductVariantWithDetails = {
        ...newVariant,
        product: products.find(p => p.id === newVariant.product_id)!,
        images: []
      };
      setVariants(prev => [...prev, variantWithDetails]);
      // Сброс формы
      setFormData({
        product_id: 0,
        price: 0,
        stock_quantity: 0,
        color: '',
        size: '',
        material: '',
      });
      setFormErrors({});
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Ошибка создания варианта:', error);
    }
  }, [formData, validateForm, createVariantActions, products]);

  const handleEdit = useCallback((variant: ProductVariantWithDetails) => {
    setEditingVariant(variant);
    setFormData({
      product_id: variant.product_id,
      price: variant.price,
      stock_quantity: variant.stock_quantity,
      color: variant.color || '',
      size: variant.size || '',
      material: variant.material || '',
    });
    setFormErrors({});
    setIsEditOpen(true);
  }, []);

  const handleUpdate = useCallback(async () => {
    if (!editingVariant || !validateForm()) return;

    try {
      const updateData = variantFormToUpdate(formData);
      const updatedVariant = await updateVariantActions.execute(editingVariant.id, updateData);
      // Преобразуем ProductVariant в ProductVariantWithDetails
      const variantWithDetails: ProductVariantWithDetails = {
        ...updatedVariant,
        product: products.find(p => p.id === updatedVariant.product_id)!,
        images: editingVariant.images || []
      };
      setVariants(prev => prev.map(variant =>
        variant.id === editingVariant.id ? variantWithDetails : variant
      ));
      // Сброс формы
      setFormData({
        product_id: 0,
        price: 0,
        stock_quantity: 0,
        color: '',
        size: '',
        material: '',
      });
      setFormErrors({});
      setIsEditOpen(false);
      setEditingVariant(null);
    } catch (error) {
      console.error('Ошибка обновления варианта:', error);
    }
  }, [editingVariant, formData, validateForm, updateVariantActions, products]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteVariantActions.execute(id);
      setVariants(prev => prev.filter(variant => variant.id !== id));
    } catch (error) {
      console.error('Ошибка удаления варианта:', error);
    }
  }, [deleteVariantActions]);

  const getStockBadge = useCallback((stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Нет в наличии</Badge>;
    } else if (stock < 10) {
      return <Badge variant="secondary">Мало</Badge>;
    } else {
      return <Badge variant="default">В наличии</Badge>;
    }
  }, []);

  const handleShowImages = useCallback((variantId: number) => {
    navigate(`/variants/${variantId}/images`);
  }, [navigate]);

  const isLoading = getVariantsState.loading || getProductsState.loading;
  const error = getVariantsState.error || getProductsState.error;

  if (isLoading && variants.length === 0) {
    return <LoadingState message="Загрузка вариантов..." />;
  }

  if (error) {
    return <ApiError error={error} onRetry={loadData} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Варианты товаров</h1>
          <p className="text-gray-600">Управление вариантами товаров (цвет, размер, цена, остатки)</p>
        </div>
        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить вариант
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-[600px] bg-white" onPointerDownOutside={(e) => e.preventDefault()}>
            <SheetHeader>
              <SheetTitle>Новый вариант товара</SheetTitle>
              <SheetDescription>
                Создайте новый вариант товара с указанием характеристик и цены.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <VariantForm 
                formData={formData}
                setFormData={setFormData}
                products={products}
                onSubmit={handleCreate}
                onCancel={() => setIsCreateOpen(false)}
                isLoading={createVariantState.loading}
                errors={formErrors}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle>Поиск и фильтры</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Input 
            placeholder="Поиск по товару, цене, цвету, размеру..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="flex-1" 
          />
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Все товары" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все товары</SelectItem>
              {products.map(product => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Все остатки" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все остатки</SelectItem>
              <SelectItem value="in-stock">В наличии</SelectItem>
              <SelectItem value="low">Мало</SelectItem>
              <SelectItem value="out">Нет в наличии</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Таблица вариантов */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Товар</TableHead>
                <TableHead>Характеристики</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Остатки</TableHead>
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
                      <p className="font-medium">{variant.product?.name}</p>
                      <p className="text-sm text-gray-500">ID: {variant.product_id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {variant.color && (
                        <div className="flex items-center space-x-2">
                          <Palette className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{variant.color}</span>
                        </div>
                      )}
                      {variant.size && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">Размер:</span>
                          <span className="text-sm">{variant.size}</span>
                        </div>
                      )}
                      {variant.material && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">Материал:</span>
                          <span className="text-sm">{variant.material}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{formatPrice(variant.price)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStockBadge(variant.stock_quantity)}
                      <span className="text-sm text-gray-500">({variant.stock_quantity})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {variant.images?.length || 0} изображений
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleShowImages(variant.id)}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(variant)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удалить вариант?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Вы уверены, что хотите удалить этот вариант? Это действие нельзя отменить. Все связанные изображения также будут удалены.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(variant.id)}
                              disabled={deleteVariantState.loading}
                            >
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

      {/* Sheet для редактирования */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="w-full sm:max-w-[600px] bg-white" onPointerDownOutside={(e) => e.preventDefault()}>
          <SheetHeader>
            <SheetTitle>Редактировать вариант</SheetTitle>
            <SheetDescription>
              Измените характеристики варианта товара.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <VariantForm 
              formData={formData}
              setFormData={setFormData}
              products={products}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditOpen(false)}
              isLoading={updateVariantState.loading}
              errors={formErrors}
              isEdit
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
