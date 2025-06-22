import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
import { imagesApi } from '@/services/images-api';
import { getImageUrl } from '@/config/api';
import type { ProductVariantWithDetails, ProductImage, Product } from '@/types';
import { ImageUpload } from '@/components/ImageUpload';
import { Plus, Loader2, Image as ImageIcon, Star, Trash2, Eye } from 'lucide-react';

// Компонент карточки изображения
const ImageCard = ({
  image,
  variantName,
  onSetMain,
  onDelete,
}: {
  image: ProductImage;
  variantName: string;
  onSetMain: (id: number) => void;
  onDelete: (id: number) => void;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingMain, setIsSettingMain] = useState(false);
  
  const getFileName = (url: string) => url.split('/').pop() || 'image.jpg';
  const getFileExtension = (url:string) => url.split('.').pop()?.toUpperCase() || 'JPG';

  return (
    <Card className="overflow-hidden group relative">
      <div className="aspect-square bg-gray-100">
        <img
          src={getImageUrl(image.url)}
          alt={variantName}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <p className="text-sm font-medium truncate">{getFileName(image.url)}</p>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">Порядок: {image.order || 1}</p>
          <Badge variant="outline">{getFileExtension(image.url)}</Badge>
        </div>
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => window.open(getImageUrl(image.url), '_blank')}>
          <Eye className="h-4 w-4" />
        </Button>
        {!image.is_main && (
          <Button 
            variant="outline" size="icon" className="h-8 w-8" 
            onClick={async () => { setIsSettingMain(true); await onSetMain(image.id); setIsSettingMain(false); }}>
            {isSettingMain ? <Loader2 className="h-4 w-4 animate-spin"/> : <Star className="h-4 w-4" />}
          </Button>
        )}
        <Button 
          variant="destructive" size="icon" className="h-8 w-8"
          onClick={async () => { setIsDeleting(true); await onDelete(image.id); setIsDeleting(false); }}>
           {isDeleting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>

      {image.is_main && (
        <Badge className="absolute top-2 left-2 bg-yellow-400 text-black">
          <Star className="h-3 w-3 mr-1" />
          Главное
        </Badge>
      )}
    </Card>
  );
};

// Компонент для загрузки изображений
const UploadImageSheet = ({
  variant,
  onUploadComplete,
}: {
  variant: ProductVariantWithDetails;
  onUploadComplete: () => void;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isMain, setIsMain] = useState(false);
  const [uploadingState, uploadActions] = useApi(imagesApi.create.bind(imagesApi));

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    // For now, upload one by one. Could be parallelized.
    for (const file of files) {
      await uploadActions.execute({
        variant_id: variant.id,
        file: file,
        is_main: files.length === 1 ? isMain : false,
      });
    }
    onUploadComplete();
    setFiles([]);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Добавить
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Загрузить изображения</SheetTitle>
          <SheetDescription>
            Для варианта: {variant.product.name} ({variant.color}, {variant.size})
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <ImageUpload
            onFilesSelect={setFiles}
            uploadingFiles={[]}
          />
          {files.length === 1 && (
             <div className="flex items-center space-x-2">
               <input type="checkbox" id="is-main-checkbox" checked={isMain} onChange={e => setIsMain(e.target.checked)} />
               <Label htmlFor="is-main-checkbox">Сделать главным?</Label>
            </div>
          )}
          <Button onClick={handleUpload} disabled={files.length === 0 || uploadingState.loading} className="w-full">
            {uploadingState.loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Загрузить'}
          </Button>
          {uploadingState.error && <p className="text-red-500 text-sm">{uploadingState.error.message}</p>}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export function Images() {
  const [variants, setVariants] = useState<ProductVariantWithDetails[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  
  const [searchParams] = useSearchParams();
  const [variantFilter, setVariantFilter] = useState(() => {
    return searchParams.get('variant_id') || 'all';
  });

  const [getVariantsState, getVariantsActions] = useApi(variantsApi.getAllWithDetails.bind(variantsApi));
  const [, setMainImageActions] = useApi(imagesApi.setMain.bind(imagesApi));
  const [, deleteImageActions] = useApi(imagesApi.delete.bind(imagesApi));

  const loadData = () => getVariantsActions.execute();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (getVariantsState.data) {
      const loadedVariants = getVariantsState.data;
      setVariants(loadedVariants);
      const uniqueProducts = [...new Map(loadedVariants.map(v => v.product).map(p => [p.id, p])).values()];
      setAllProducts(uniqueProducts);

      // Устанавливаем фильтр из URL после загрузки данных
      const variantIdFromUrl = searchParams.get('variant_id');
      if (variantIdFromUrl && loadedVariants.some(v => v.id.toString() === variantIdFromUrl)) {
        setVariantFilter(variantIdFromUrl);
      }
    }
  }, [getVariantsState.data, searchParams]);
  
  const handleSetMain = async (id: number) => {
    await setMainImageActions.execute(id);
    loadData();
  };

  const handleDelete = async (id: number) => {
    await deleteImageActions.execute(id);
    loadData();
  };

  const filteredVariants = useMemo(() => {
    return variants
      .filter(v => {
        const matchesProduct = productFilter === 'all' || v.product.id.toString() === productFilter;
        const matchesVariant = variantFilter === 'all' || v.id.toString() === variantFilter;
        const matchesSearch =
          v.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (v.color || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (v.size || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesProduct && matchesVariant && matchesSearch;
      });
  }, [variants, productFilter, variantFilter, searchTerm]);

  const allImagesCount = variants.reduce((acc, v) => acc + (v.images?.length || 0), 0);
  const mainImagesCount = variants.reduce((acc, v) => acc + (v.images?.filter(i => i.is_main).length || 0), 0);

  if (getVariantsState.loading && variants.length === 0) return <LoadingState message="Загрузка изображений..." />;
  if (getVariantsState.error) return <ApiError error={getVariantsState.error} onRetry={loadData} />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Изображения</h1>
        {/* Top level upload button can be added here if needed */}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Всего изображений</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{allImagesCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Вариантов с фото</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{variants.filter(v => v.images && v.images.length > 0).length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Главных изображений</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{mainImagesCount}</div></CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader><CardTitle>Поиск и фильтры</CardTitle></CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
              <Input
              placeholder="Поиск по названию, варианту..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
              />
              <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Все товары" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все товары</SelectItem>
              {allProducts.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={variantFilter} onValueChange={setVariantFilter}>
            <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Все варианты" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все варианты</SelectItem>
              {variants.map(v => <SelectItem key={v.id} value={v.id.toString()}>{v.product.name} ({v.color}, {v.size})</SelectItem>)}
                </SelectContent>
              </Select>
        </CardContent>
      </Card>

      {/* Image Groups */}
      <div className="space-y-6">
        {filteredVariants.map(variant => (
          <Card key={variant.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{variant.product.name} - {variant.color}, {variant.size}</CardTitle>
                    <CardDescription>Остаток: {variant.stock_quantity} шт.</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{variant.images.length} изображений</Badge>
                    <UploadImageSheet variant={variant} onUploadComplete={loadData} />
                  </div>
              </div>
            </CardHeader>
            <CardContent>
              {variant.images && variant.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {variant.images.map(image => (
                    <ImageCard 
                      key={image.id} 
                      image={image} 
                      variantName={`${variant.product.name} ${variant.color}`} 
                      onSetMain={handleSetMain}
                      onDelete={handleDelete}
                    />
                ))}
              </div>
              ) : (
                <div className="text-center py-10 text-gray-500 border-2 border-dashed rounded-lg bg-gray-50">
                  <ImageIcon className="mx-auto h-8 w-8" />
                  <p className="mt-2 font-semibold">Изображений нет</p>
                  <p className="text-sm">Нажмите «Добавить», чтобы загрузить первое.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filteredVariants.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <ImageIcon className="mx-auto h-12 w-12" />
            <p className="mt-4">Изображения не найдены</p>
            <p className="text-sm">Попробуйте изменить фильтры или добавить изображения.</p>
          </div>
        )}
      </div>
    </div>
  );
}
