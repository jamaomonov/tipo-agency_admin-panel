import { useState, useEffect } from 'react';
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
import { imagesApi } from '@/services/images-api';
import { variantsApi } from '@/services/variants-api';
import { productsApi } from '@/services/products-api';
import { ImageUpload } from '@/components/ImageUpload';
import { getImageUrl, formatPrice } from '@/lib/utils';
import type { ProductImage, ProductVariantWithDetails, Product } from '@/types';
import { Plus, Trash2, Star, Eye, Download } from 'lucide-react';

export function Images() {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariantWithDetails[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [variantFilter, setVariantFilter] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<number>(0);
  const [uploadingFiles, setUploadingFiles] = useState<{ file: File, progress: number, error?: string }[]>([]);

  // API хуки
  const [getImagesState, getImagesActions] = useApi(imagesApi.getAll.bind(imagesApi));
  const [getVariantsState, getVariantsActions] = useApi(variantsApi.getAllWithDetails.bind(variantsApi));
  const [getProductsState, getProductsActions] = useApi(productsApi.getAll.bind(productsApi));
  const [updateImageState, updateImageActions] = useApi(imagesApi.update.bind(imagesApi));
  const [deleteImageState, deleteImageActions] = useApi(imagesApi.delete.bind(imagesApi));

  // Загрузка данных при монтировании
  useEffect(() => {
    loadData();
  }, []);

  // Обновление локального состояния при получении данных
  useEffect(() => {
    if (getImagesState.data) {
      setImages(getImagesState.data);
    }
  }, [getImagesState.data]);

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
        getImagesActions.execute(),
        getVariantsActions.execute(),
        getProductsActions.execute(),
      ]);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  const filteredImages = images.filter(image => {
    const variant = variants.find(v => v.id === image.variant_id);
    const product = variant?.product;
    
    const matchesSearch = 
      (product?.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (variant?.color && variant.color.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (variant?.size && variant.size.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesProduct = productFilter === 'all' || (product && product.id.toString() === productFilter);
    const matchesVariant = variantFilter === 'all' || (variant && variant.id.toString() === variantFilter);

    return matchesSearch && matchesProduct && matchesVariant;
  });

  const handleFileSelect = (files: File[]) => {
    // Сбрасываем прогресс загрузки
    setUploadingFiles(files.map(file => ({ file, progress: 0 })));
  };

  const handleUpload = async () => {
    if (selectedVariant === 0) {
      alert('Выберите вариант товара');
      return;
    }

    const files = uploadingFiles.map(uf => uf.file);
    if (files.length === 0) {
      alert('Выберите файлы для загрузки');
      return;
    }

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Обновляем прогресс
        setUploadingFiles(prev => prev.map((uf, index) => 
          index === i ? { ...uf, progress: 10 } : uf
        ));

        // Загружаем изображение
        const isMain = i === 0; // Первое изображение становится главным
        await getImagesActions.execute({
          variant_id: selectedVariant,
          is_main: isMain,
          file: file
        });

        // Обновляем прогресс
        setUploadingFiles(prev => prev.map((uf, index) => 
          index === i ? { ...uf, progress: 100 } : uf
        ));
      }

      // Перезагружаем данные
      await loadData();
      setIsUploadOpen(false);
      setUploadingFiles([]);
      setSelectedVariant(0);
    } catch (error) {
      console.error('Ошибка загрузки изображений:', error);
      // Показываем ошибку для всех файлов
      setUploadingFiles(prev => prev.map(uf => ({ ...uf, error: 'Ошибка загрузки' })));
    }
  };

  const handleSetMain = async (imageId: number) => {
    try {
      await updateImageActions.execute(imageId, { is_main: true });
      await loadData();
    } catch (error) {
      console.error('Ошибка установки главного изображения:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteImageActions.execute(id);
      setImages(images.filter(image => image.id !== id));
    } catch (error) {
      console.error('Ошибка удаления изображения:', error);
    }
  };

  const getVariantInfo = (variantId: number) => {
    return variants.find(v => v.id === variantId);
  };

  const isLoading = getImagesState.loading || getVariantsState.loading || getProductsState.loading;
  const error = getImagesState.error || getVariantsState.error || getProductsState.error;

  if (isLoading && images.length === 0) {
    return <LoadingState message="Загрузка изображений..." />;
  }

  if (error) {
    return <ApiError error={error} onRetry={loadData} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Изображения товаров</h1>
          <p className="text-gray-600">Управление изображениями для вариантов товаров</p>
        </div>
        <Sheet open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Загрузить изображения
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[600px]">
            <SheetHeader>
              <SheetTitle>Загрузка изображений</SheetTitle>
              <SheetDescription>
                Выберите вариант товара и загрузите изображения. Первое изображение станет главным.
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="variant">Вариант товара</Label>
                <Select
                  value={selectedVariant ? selectedVariant.toString() : ''}
                  onValueChange={(value) => setSelectedVariant(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите вариант товара" />
                  </SelectTrigger>
                  <SelectContent>
                    {variants.map(variant => (
                      <SelectItem key={variant.id} value={variant.id.toString()}>
                        {variant.product?.name} - {variant.color || 'Без цвета'} {variant.size || 'Без размера'} ({formatPrice(variant.price)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <ImageUpload
                onFilesSelect={handleFileSelect}
                uploadingFiles={uploadingFiles}
                maxFiles={10}
                className="mt-4"
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleUpload} disabled={selectedVariant === 0 || uploadingFiles.length === 0}>
                  Загрузить
                </Button>
              </div>
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
            placeholder="Поиск по названию товара, цвету, размеру..." 
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
          <Select value={variantFilter} onValueChange={setVariantFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Все варианты" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все варианты</SelectItem>
              {variants.map(variant => (
                <SelectItem key={variant.id} value={variant.id.toString()}>
                  {variant.product?.name} - {variant.color || 'Без цвета'} {variant.size || 'Без размера'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Таблица изображений */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Изображение</TableHead>
                <TableHead>Товар</TableHead>
                <TableHead>Вариант</TableHead>
                <TableHead>Главное</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredImages.map((image) => {
                const variant = getVariantInfo(image.variant_id);
                const product = variant?.product;
                
                return (
                  <TableRow key={image.id}>
                    <TableCell>
                      <div className="relative">
                        <img 
                          src={getImageUrl(image.url)} 
                          alt={`Изображение ${image.id}`}
                          className="h-16 w-16 object-cover rounded-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyMEMyNS4zNzIgMjAgMjAgMjUuMzcyIDIwIDMyQzIwIDM4LjYyOCAyNS4zNzIgNDQgMzIgNDRDMzguNjI4IDQ0IDQ0IDM4LjYyOCA0NCAzMkM0NCAyNS4zNzIgMzguNjI4IDIwIDMyIDIwWiIgZmlsbD0iI0QxRDVEMTkiLz4KPC9zdmc+';
                          }}
                        />
                        {image.is_main && (
                          <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                            <Star className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">ID: {product?.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {variant?.color || 'Без цвета'} {variant?.size || 'Без размера'}
                        </p>
                        <p className="text-sm text-gray-500">{formatPrice(variant?.price || 0)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {image.is_main ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Главное
                        </Badge>
                      ) : (
                        <Badge variant="outline">Дополнительное</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={getImageUrl(image.url)} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={getImageUrl(image.url)} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        {!image.is_main && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSetMain(image.id)}
                            disabled={updateImageState.loading}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить изображение?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Вы уверены, что хотите удалить это изображение? Это действие нельзя отменить.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(image.id)}
                                disabled={deleteImageState.loading}
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
    </div>
  );
}
