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
import { ImageUpload } from '@/components/ImageUpload';
import {
  mockImages,
  mockVariants,
  mockProducts,
  getImagesWithVariants,
  getProductById
} from '@/data/mockData';
import type { ProductImage, FileUpload } from '@/types';
import { Plus, Trash2, Search, Images as ImagesIcon, Eye, Star, StarOff } from 'lucide-react';

export function Images() {
  const [images, setImages] = useState<ProductImage[]>(mockImages);
  const [searchTerm, setSearchTerm] = useState('');
  const [variantFilter, setVariantFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    variantId: '',
    files: [] as FileUpload[],
  });

  const imagesWithVariants = getImagesWithVariants();

  const filteredImages = imagesWithVariants.filter(imageData => {
    const matchesSearch =
      imageData.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imageData.variant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imageData.variant.product.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVariant = variantFilter === 'all' || imageData.variantId === variantFilter;
    const matchesProduct = productFilter === 'all' || imageData.variant.productId === productFilter;

    return matchesSearch && matchesVariant && matchesProduct;
  });

  const handleUpload = () => {
    if (!uploadData.variantId || uploadData.files.length === 0) {
      alert('Выберите вариант товара и загрузите хотя бы одно изображение');
      return;
    }

    const newImages: ProductImage[] = uploadData.files.map((file, index) => ({
      id: Date.now().toString() + index,
      variantId: uploadData.variantId,
      url: file.preview, // В реальном приложении здесь был бы URL с сервера
      filename: file.file.name,
      size: file.file.size,
      mimeType: file.file.type,
      isMain: index === 0 && images.filter(img => img.variantId === uploadData.variantId).length === 0,
      order: images.filter(img => img.variantId === uploadData.variantId).length + index + 1,
      createdAt: new Date(),
    }));

    setImages([...images, ...newImages]);
    setUploadData({ variantId: '', files: [] });
    setIsUploadOpen(false);
  };

  const handleDelete = (id: string) => {
    setImages(images.filter(image => image.id !== id));
  };

  const toggleMainImage = (imageId: string, variantId: string) => {
    const updatedImages = images.map(image => {
      if (image.variantId === variantId) {
        return { ...image, isMain: image.id === imageId };
      }
      return image;
    });
    setImages(updatedImages);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const stats = {
    total: images.length,
    variants: new Set(images.map(img => img.variantId)).size,
    mainImages: images.filter(img => img.isMain).length,
  };

  const groupedImages = filteredImages.reduce((groups, imageData) => {
    const key = `${imageData.variant.product.name} - ${imageData.variant.name}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(imageData);
    return groups;
  }, {} as Record<string, typeof filteredImages>);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <ImagesIcon className="h-8 w-8 text-blue-600" />
            <span>Изображения</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Управление изображениями товаров
          </p>
        </div>

        <Sheet open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <SheetTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Загрузить изображения
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[600px] sm:w-[700px] max-w-[90vw]">
            <SheetHeader>
              <SheetTitle>Загрузить изображения</SheetTitle>
              <SheetDescription>
                Выберите вариант товара и загрузите изображения
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              {/* Variant Selection */}
              <div className="space-y-2">
                <Label htmlFor="variant">Вариант товара</Label>
                <Select
                  value={uploadData.variantId}
                  onValueChange={(value) => setUploadData({ ...uploadData, variantId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите вариант товара" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockVariants.map((variant) => {
                      const product = getProductById(variant.productId);
                      return (
                        <SelectItem key={variant.id} value={variant.id}>
                          {product?.name} - {variant.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Изображения</Label>
                <ImageUpload
                  onFilesChange={(files) => setUploadData({ ...uploadData, files })}
                  maxFiles={10}
                  maxSizeInMB={5}
                  acceptedFormats={['jpg', 'jpeg', 'png']}
                  initialFiles={uploadData.files}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadData({ variantId: '', files: [] });
                    setIsUploadOpen(false);
                  }}
                >
                  Отмена
                </Button>
                <Button onClick={handleUpload}>
                  Загрузить изображения
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего изображений</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Вариантов с фото</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.variants}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Главных изображений</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.mainImages}</div>
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
                placeholder="Поиск по названию файла, варианту, товару..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
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

            <div className="w-64">
              <Select value={variantFilter} onValueChange={setVariantFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Вариант" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все варианты</SelectItem>
                  {mockVariants.map((variant) => {
                    const product = getProductById(variant.productId);
                    return (
                      <SelectItem key={variant.id} value={variant.id}>
                        {product?.name} - {variant.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images by Variant */}
      <div className="space-y-6">
        {Object.entries(groupedImages).map(([variantKey, variantImages]) => (
          <Card key={variantKey}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{variantKey}</span>
                <Badge variant="outline">
                  {variantImages.length} изображений
                </Badge>
              </CardTitle>
              <CardDescription>
                SKU: {variantImages[0]?.variant.sku} •
                Остаток: {variantImages[0]?.variant.stock} шт
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {variantImages.map((imageData) => (
                  <Card key={imageData.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative aspect-square bg-gray-100">
                        <img
                          src={imageData.url}
                          alt={imageData.filename}
                          className="w-full h-full object-cover"
                        />

                        {/* Main Badge */}
                        {imageData.isMain && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-yellow-500 text-white">
                              <Star className="h-3 w-3 mr-1" />
                              Главное
                            </Badge>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                            onClick={() => window.open(imageData.url, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                            onClick={() => toggleMainImage(imageData.id, imageData.variantId)}
                          >
                            {imageData.isMain ? (
                              <StarOff className="h-4 w-4" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить изображение?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Это действие нельзя отменить. Изображение "{imageData.filename}" будет удалено навсегда.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(imageData.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Удалить
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="p-3">
                        <div className="text-sm font-medium text-gray-900 truncate" title={imageData.filename}>
                          {imageData.filename}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">
                            {formatFileSize(imageData.size)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {imageData.mimeType.split('/')[1]?.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Порядок: {imageData.order}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {variantImages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Нет изображений для этого варианта
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {Object.keys(groupedImages).length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <ImagesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Изображения не найдены
              </h3>
              <p className="text-gray-500">
                Попробуйте изменить параметры поиска или загрузите новые изображения
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
