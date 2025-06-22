import { useState } from 'react';
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
import { mockVariants, mockProducts, getProductById, getImagesByVariantId } from '@/data/mockData';
import type { ProductVariant, ProductVariantFormData } from '@/types';
import { Plus, Edit, Trash2, Search, Palette, Package, Eye, AlertTriangle } from 'lucide-react';

export function Variants() {
  const [variants, setVariants] = useState<ProductVariant[]>(mockVariants);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [formData, setFormData] = useState<ProductVariantFormData>({
    productId: '',
    name: '',
    color: '',
    size: '',
    material: '',
    price: undefined,
    sku: '',
    stock: 0,
    status: 'active',
  });

  const filteredVariants = variants.filter(variant => {
    const matchesSearch =
      variant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variant.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (variant.color && variant.color.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (variant.size && variant.size.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || variant.status === statusFilter;
    const matchesProduct = productFilter === 'all' || variant.productId === productFilter;

    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = variant.stock > 0 && variant.stock < 10;
    } else if (stockFilter === 'out') {
      matchesStock = variant.stock === 0;
    } else if (stockFilter === 'in-stock') {
      matchesStock = variant.stock >= 10;
    }

    return matchesSearch && matchesStatus && matchesProduct && matchesStock;
  });

  const generateSku = (productSku: string, color?: string, size?: string) => {
    let sku = productSku;
    if (color) sku += `-${color.toUpperCase().replace(/\s+/g, '')}`;
    if (size) sku += `-${size.toUpperCase().replace(/\s+/g, '')}`;
    return sku;
  };

  const handleCreate = () => {
    const product = getProductById(formData.productId);
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setVariants([...variants, newVariant]);
    setFormData({
      productId: '',
      name: '',
      color: '',
      size: '',
      material: '',
      price: undefined,
      sku: '',
      stock: 0,
      status: 'active'
    });
    setIsCreateOpen(false);
  };

  const handleEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setFormData({
      productId: variant.productId,
      name: variant.name,
      color: variant.color || '',
      size: variant.size || '',
      material: variant.material || '',
      price: variant.price,
      sku: variant.sku,
      stock: variant.stock,
      status: variant.status,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingVariant) return;

    const updatedVariants = variants.map(variant =>
      variant.id === editingVariant.id
        ? { ...variant, ...formData, updatedAt: new Date() }
        : variant
    );
    setVariants(updatedVariants);
    setFormData({
      productId: '',
      name: '',
      color: '',
      size: '',
      material: '',
      price: undefined,
      sku: '',
      stock: 0,
      status: 'active'
    });
    setEditingVariant(null);
    setIsEditOpen(false);
  };

  const handleDelete = (id: string) => {
    setVariants(variants.filter(variant => variant.id !== id));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Активный</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Неактивный</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  const formatPrice = (price?: number) => {
    if (!price) return '-';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(price);
  };

  const VariantForm = ({ isEdit = false }: { isEdit?: boolean }) => {
    const selectedProduct = formData.productId ? getProductById(formData.productId) : null;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product">Товар</Label>
          <Select
            value={formData.productId}
            onValueChange={(value) => {
              const product = getProductById(value);
              setFormData({
                ...formData,
                productId: value,
                sku: formData.sku || (product ? generateSku(product.sku, formData.color, formData.size) : '')
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите товар" />
            </SelectTrigger>
            <SelectContent>
              {mockProducts.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Название варианта</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Например: Футболка Premium - Белая M"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="color">Цвет</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => {
                const color = e.target.value;
                setFormData({
                  ...formData,
                  color,
                  sku: selectedProduct ? generateSku(selectedProduct.sku, color, formData.size) : formData.sku
                });
              }}
              placeholder="Белый, Черный..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Размер</Label>
            <Input
              id="size"
              value={formData.size}
              onChange={(e) => {
                const size = e.target.value;
                setFormData({
                  ...formData,
                  size,
                  sku: selectedProduct ? generateSku(selectedProduct.sku, formData.color, size) : formData.sku
                });
              }}
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
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="PRODUCT-001-WHITE-M"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Цена (₽, опционально)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || undefined })}
              placeholder="Оставьте пустым для цены товара"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Количество на складе</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) || 0 })}
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Статус</Label>
          <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Активный</SelectItem>
              <SelectItem value="inactive">Неактивный</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setFormData({
                productId: '',
                name: '',
                color: '',
                size: '',
                material: '',
                price: undefined,
                sku: '',
                stock: 0,
                status: 'active'
              });
              isEdit ? setIsEditOpen(false) : setIsCreateOpen(false);
            }}
          >
            Отмена
          </Button>
          <Button onClick={isEdit ? handleUpdate : handleCreate}>
            {isEdit ? 'Обновить' : 'Создать'}
          </Button>
        </div>
      </div>
    );
  };

  const stats = {
    total: variants.length,
    active: variants.filter(v => v.status === 'active').length,
    lowStock: variants.filter(v => v.stock < 10 && v.stock > 0).length,
    outOfStock: variants.filter(v => v.stock === 0).length,
  };

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
            Управление вариантами товаров (цвет, размер, материал)
          </p>
        </div>

        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Добавить вариант
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[500px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Создать вариант</SheetTitle>
              <SheetDescription>
                Добавьте новый вариант для существующего товара
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
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активных</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1 text-orange-500" />
              Мало на складе
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нет в наличии</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Поиск и фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Поиск по названию, SKU, цвету, размеру..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="inactive">Неактивные</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-48">
              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Товар" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все товары</SelectItem>
                  {mockProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-40">
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Остатки" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="in-stock">В наличии</SelectItem>
                  <SelectItem value="low">Мало</SelectItem>
                  <SelectItem value="out">Нет в наличии</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                <TableHead>Вариант</TableHead>
                <TableHead>Товар</TableHead>
                <TableHead>Атрибуты</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Остаток</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVariants.map((variant) => {
                const product = getProductById(variant.productId);
                const images = getImagesByVariantId(variant.id);
                return (
                  <TableRow key={variant.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{variant.name}</div>
                        {images.length > 0 && (
                          <div className="text-sm text-green-600">
                            📷 {images.length} изображений
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product ? (
                        <div className="space-y-1">
                          <div className="font-medium">{product.name}</div>
                          <Badge variant="outline">{product.sku}</Badge>
                        </div>
                      ) : (
                        <span className="text-gray-400">Товар не найден</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {variant.color && (
                          <div className="text-sm">
                            <span className="font-medium">Цвет:</span> {variant.color}
                          </div>
                        )}
                        {variant.size && (
                          <div className="text-sm">
                            <span className="font-medium">Размер:</span> {variant.size}
                          </div>
                        )}
                        {variant.material && (
                          <div className="text-sm">
                            <span className="font-medium">Материал:</span> {variant.material}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{variant.sku}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {variant.price ? formatPrice(variant.price) :
                        product ? formatPrice(product.price) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{variant.stock}</div>
                        {getStockBadge(variant.stock)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(variant.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Реализовать просмотр деталей варианта
                            alert(`Просмотр варианта: ${variant.name}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(variant)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить вариант?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Это действие нельзя отменить. Вариант "{variant.name}" будет удален навсегда.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(variant.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="w-[500px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Редактировать вариант</SheetTitle>
            <SheetDescription>
              Измените параметры варианта товара
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <VariantForm isEdit />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
