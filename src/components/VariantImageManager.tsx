import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useApi } from '@/hooks/use-api';
import { imagesApi } from '@/services/images-api';
import { getImageUrl } from '@/config/api';
import type { ProductVariant, ProductImage, ImageCreateRequest, ImageUpdateRequest } from '@/types';
import { 
  Image as ImageIcon, 
  Upload, 
  Edit, 
  Trash2, 
  Star, 
  X,
  Eye,
  Check
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { LoadingState } from '@/components/ui/loading-state';
import { ImagePreview } from '@/components/ui/image-preview';

interface VariantImageManagerProps {
  variant: ProductVariant;
  onImagesChange: () => void;
}

export function VariantImageManager({ variant, onImagesChange }: VariantImageManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isMainImage, setIsMainImage] = useState(false);
  const [editingImage, setEditingImage] = useState<ProductImage | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<ProductImage | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [createState, createActions] = useApi(imagesApi.create.bind(imagesApi));
  const [updateState, updateActions] = useApi(imagesApi.update.bind(imagesApi));
  const [deleteState, deleteActions] = useApi(imagesApi.delete.bind(imagesApi));

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const images = variant.images || [];
    const hasMainImage = images.some(img => img.is_main);
    if (isMainImage && hasMainImage) {
      alert('У этого варианта уже есть главное изображение. Сначала снимите отметку с текущего главного изображения.');
      return;
    }

    try {
      setIsUploading(true);
      const imageData: ImageCreateRequest = {
        variant_id: variant.id,
        file: selectedFile,
        is_main: isMainImage,
      };
      
      await createActions.execute(imageData);
      setSelectedFile(null);
      setIsMainImage(false);
      setUploadSuccess(true);
      onImagesChange();
      
      // Сбрасываем успех через 3 секунды
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditImage = (image: ProductImage) => {
    setEditingImage(image);
    setIsEditModalOpen(true);
    setUpdateSuccess(false);
  };

  const handlePreviewImage = (image: ProductImage) => {
    setPreviewImage(image);
  };

  const handleUpdateImage = async (data: ImageUpdateRequest) => {
    if (!editingImage) return;

    const images = variant.images || [];
    const hasOtherMainImage = images.some(img => img.is_main && img.id !== editingImage.id);
    if (data.is_main && hasOtherMainImage) {
      alert('У этого варианта уже есть главное изображение. Сначала снимите отметку с текущего главного изображения.');
      return;
    }

    try {
      await updateActions.execute(editingImage.id, data);
      setUpdateSuccess(true);
      onImagesChange();
      
      // Сбрасываем успех через 3 секунды
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Ошибка обновления изображения:', error);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await deleteActions.execute(imageId);
      onImagesChange();
    } catch (error) {
      console.error('Ошибка удаления изображения:', error);
    }
  };

  const handleMainImageToggle = (checked: boolean) => {
    if (checked && mainImage) {
      alert('У этого варианта уже есть главное изображение. Сначала снимите отметку с текущего главного изображения.');
      return;
    }
    setIsMainImage(checked);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingImage(null);
    setUpdateSuccess(false);
  };

  const images = variant.images || [];
  const mainImage = images.find(img => img.is_main);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Загрузка нового изображения */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-base sm:text-lg">Загрузить изображение</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Добавьте новое изображение для варианта "{variant.color || variant.size || 'Без названия'}"
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-upload" className="text-sm sm:text-base">Выберите файл</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="text-sm"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is-main"
                checked={isMainImage}
                onCheckedChange={handleMainImageToggle}
                disabled={isUploading || (mainImage && !isMainImage)}
              />
              <Label htmlFor="is-main" className="text-sm sm:text-base">
                Сделать главным изображением
                {mainImage && !isMainImage && (
                  <span className="text-xs text-gray-500 ml-1">(уже есть главное)</span>
                )}
              </Label>
            </div>

            {selectedFile && (
              <div className="flex items-center space-x-2 p-2 sm:p-3 bg-gray-50 rounded-lg">
                <ImageIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-600 truncate flex-1">{selectedFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  disabled={isUploading}
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            )}

            {uploadSuccess && (
              <div className="flex items-center space-x-2 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-700">Изображение успешно загружено!</span>
              </div>
            )}

            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading || createState.loading}
              className="w-full"
            >
              {isUploading || createState.loading ? (
                <>
                  <LoadingState message="Загрузка..." />
                  <span className="ml-2">Загрузка...</span>
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  <span className="text-sm sm:text-base">Загрузить изображение</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Список изображений */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-base sm:text-lg">Изображения варианта ({images.length})</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Управление изображениями для данного варианта товара
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {images.length > 0 ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {images.map(image => (
                <div key={image.id} className="relative group">
                  <div className="relative">
                    <img 
                      src={getImageUrl(image.url)} 
                      alt={`Изображение ${image.id}`}
                      className="w-full h-24 sm:h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => handlePreviewImage(image)}
                      tabIndex={0}
                      onFocus={() => {}}
                    />
                    
                    {/* Главное изображение badge */}
                    {image.is_main && (
                      <Badge className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-yellow-400 text-black text-xs">
                        <Star className="mr-1 h-3 w-3" />
                        <span className="hidden sm:inline">Главное</span>
                        <span className="sm:hidden">Гл</span>
                      </Badge>
                    )}
                    
                    {/* Действия при наведении */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 sm:group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-1 sm:space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handlePreviewImage(image)}
                        className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditImage(image)}
                        className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удалить изображение?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Вы уверены, что хотите удалить это изображение? Это действие нельзя отменить.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteImage(image.id)}
                              disabled={deleteState.loading}
                            >
                              Удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  <div className="mt-1 sm:mt-2 text-center">
                    <p className="text-xs text-gray-500">ID: {image.id}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <ImageIcon className="mx-auto h-8 w-8 sm:h-12 sm:w-12" />
              <p className="mt-2 sm:mt-4 text-sm sm:text-base">Изображений нет</p>
              <p className="text-xs sm:text-sm">Загрузите первое изображение для этого варианта</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Модальное окно редактирования изображения */}
      {editingImage && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 full-screen-mobile ${isEditModalOpen ? 'block' : 'hidden'}`}>
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto max-h-[90vh] sm:max-h-none overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold">Редактировать изображение</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseEditModal}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <img 
                  src={getImageUrl(editingImage.url)} 
                  alt="Редактируемое изображение"
                  className="max-w-full h-32 sm:h-48 object-cover rounded-lg cursor-pointer"
                  onClick={() => handlePreviewImage(editingImage)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is-main"
                  checked={editingImage.is_main}
                  onCheckedChange={(checked) => {
                    // Проверяем, есть ли уже главное изображение (кроме текущего редактируемого)
                    const hasOtherMainImage = images.some(img => img.is_main && img.id !== editingImage.id);
                    if (checked && hasOtherMainImage) {
                      alert('У этого варианта уже есть главное изображение. Сначала снимите отметку с текущего главного изображения.');
                      return;
                    }
                    setEditingImage({ ...editingImage, is_main: checked });
                  }}
                  disabled={images.some(img => img.is_main && img.id !== editingImage.id)}
                />
                <Label htmlFor="edit-is-main" className="text-sm sm:text-base">
                  Главное изображение
                  {images.some(img => img.is_main && img.id !== editingImage.id) && (
                    <span className="text-xs text-gray-500 ml-1">(уже есть главное)</span>
                  )}
                </Label>
              </div>

              {updateSuccess && (
                <div className="flex items-center space-x-2 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-green-700">Изображение успешно обновлено!</span>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCloseEditModal}
                  className="w-full sm:w-auto"
                >
                  Закрыть
                </Button>
                <Button
                  onClick={() => handleUpdateImage({ is_main: editingImage.is_main })}
                  disabled={updateState.loading}
                  className="w-full sm:w-auto"
                >
                  {updateState.loading ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Предварительный просмотр изображения */}
      {previewImage && (
        <ImagePreview
          src={getImageUrl(previewImage.url)}
          alt={`Изображение ${previewImage.id}`}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
} 