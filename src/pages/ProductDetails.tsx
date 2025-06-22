import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingState } from "@/components/ui/loading-state";
import { ApiError } from "@/components/ui/api-error";
import { productsApi } from "@/services/products-api";
import { variantsApi } from "@/services/variants-api";
import { useApi } from "@/hooks/use-api";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { getImageUrl } from "@/config/api";
import { categoriesApi } from "@/services/categories-api";
import type { Product, ProductCategory, ProductImage, ProductVariant } from "@/types";
import { Package, Edit, Save, X, Image as ImageIcon } from "lucide-react";
import { VariantManager } from "./VariantManager";

interface ProductDetailsProps {
  productId: number;
}

export function ProductDetails({ productId }: ProductDetailsProps) {
  const [productState, productActions] = useApi(productsApi.getById.bind(productsApi));
  const [categoriesState, categoriesActions] = useApi(categoriesApi.getAll.bind(categoriesApi));
  const [variantsState, variantsActions] = useApi(variantsApi.getByProductId.bind(variantsApi));
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    description: '',
    category_id: undefined as number | undefined,
    is_active: true,
    is_new: false,
    is_discounted: false,
  });

  const fetchProduct = () => {
    if (productId) {
      productActions.execute(productId);
    }
  }

  const fetchCategories = () => {
    categoriesActions.execute();
  }

  const fetchVariants = () => {
    if (productId) {
      variantsActions.execute(productId);
    }
  }

  useEffect(() => {
    fetchProduct();
    fetchCategories();
    fetchVariants();
  }, [productId]);

  useEffect(() => {
    if (productState.data) {
      const product = productState.data as Product;
      setEditForm({
        name: product.name,
        slug: product.slug,
        description: product.description,
        category_id: product.category_id,
        is_active: product.is_active,
        is_new: product.is_new,
        is_discounted: product.is_discounted,
      });
    }
  }, [productState.data]);

  const handleSave = async () => {
    if (!productState.data) return;
    
    try {
      const formData = {
        ...editForm,
        category_id: editForm.category_id ?? 0
      };
      await productsApi.update(productId, formData);
      setIsEditing(false);
      fetchProduct();
    } catch (error) {
      console.error('Ошибка обновления товара:', error);
    }
  };

  const handleCancel = () => {
    if (productState.data) {
      const product = productState.data as Product;
      setEditForm({
        name: product.name,
        slug: product.slug,
        description: product.description,
        category_id: product.category_id,
        is_active: product.is_active,
        is_new: product.is_new,
        is_discounted: product.is_discounted,
      });
    }
    setIsEditing(false);
  };

  if (productState.loading) {
    return <div className="p-6"><LoadingState message="Загрузка деталей товара..." /></div>;
  }

  if (productState.error) {
    return <div className="p-6"><ApiError error={productState.error} onRetry={fetchProduct} /></div>;
  }
  
  const product = productState.data as Product;
  const categories = categoriesState.data as ProductCategory[] || [];
  const variants = variantsState.data as ProductVariant[] || [];

  if (!product) return null;

  // Собираем все изображения из всех вариантов
  const allImages: ProductImage[] = [];
  variants.forEach(variant => {
    if (variant.images) {
      allImages.push(...variant.images);
    }
  });

  return (
    <div className="bg-slate-50 p-4 border-t">
      {/* Product Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-600">ID: {product.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={product.is_active ? "default" : "secondary"}>
              {product.is_active ? "Активный" : "Неактивный"}
            </Badge>
            {product.is_new && <Badge variant="outline" className="text-green-600">Новый</Badge>}
            {product.is_discounted && <Badge variant="outline" className="text-red-600">Со скидкой</Badge>}
          </div>
        </div>
      </div>

      <Tabs defaultValue="variants">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="variants">Варианты ({variants.length})</TabsTrigger>
          <TabsTrigger value="images">Изображения ({allImages.length})</TabsTrigger>
          <TabsTrigger value="edit">Редактировать</TabsTrigger>
          <TabsTrigger value="info">Информация</TabsTrigger>
        </TabsList>
        
        <TabsContent value="variants" className="mt-6">
          <VariantManager 
            product={product} 
            variants={variants}
            onVariantsChange={() => {
              fetchProduct();
              fetchVariants();
            }} 
          />
        </TabsContent>
        
        <TabsContent value="images" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5" />
                <span>Изображения товара</span>
              </CardTitle>
              <CardDescription>
                Все изображения вариантов товара "{product.name}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {allImages.map(image => (
                    <div key={image.id} className="relative group">
                      <img 
                        src={getImageUrl(image.url)} 
                        alt={`Изображение ${image.id}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {image.is_main && (
                        <Badge className="absolute top-2 left-2 bg-yellow-400 text-black text-xs">
                          Главное
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <ImageIcon className="mx-auto h-12 w-12" />
                  <p className="mt-4">Изображений нет</p>
                  <p className="text-sm">Добавьте варианты товара, чтобы загружать изображения</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="edit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Редактирование товара</span>
                <div className="flex items-center space-x-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave} size="sm">
                        <Save className="mr-2 h-4 w-4" />
                        Сохранить
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        <X className="mr-2 h-4 w-4" />
                        Отмена
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Редактировать
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Название</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={editForm.slug}
                      onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Категория</Label>
                  <Select
                    value={editForm.category_id !== undefined ? editForm.category_id.toString() : ""}
                    onValueChange={(value) => setEditForm({ ...editForm, category_id: parseInt(value) })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={editForm.is_active}
                      onCheckedChange={(checked: boolean) => setEditForm({ ...editForm, is_active: checked })}
                      disabled={!isEditing}
                    />
                    <Label htmlFor="is_active">Активный товар</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_new"
                      checked={editForm.is_new}
                      onCheckedChange={(checked: boolean) => setEditForm({ ...editForm, is_new: checked })}
                      disabled={!isEditing}
                    />
                    <Label htmlFor="is_new">Новый товар</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_discounted"
                      checked={editForm.is_discounted}
                      onCheckedChange={(checked: boolean) => setEditForm({ ...editForm, is_discounted: checked })}
                      disabled={!isEditing}
                    />
                    <Label htmlFor="is_discounted">Товар со скидкой</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Информация о товаре</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">ID</Label>
                    <p className="text-sm">{product.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Slug</Label>
                    <p className="text-sm">{product.slug}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Название</Label>
                  <p className="text-sm">{product.name}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Описание</Label>
                  <p className="text-sm">{product.description}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Категория</Label>
                  <p className="text-sm">{product.category?.name || 'Не указана'}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Статус</Label>
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Активный" : "Неактивный"}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Новый</Label>
                    <Badge variant={product.is_new ? "outline" : "secondary"}>
                      {product.is_new ? "Да" : "Нет"}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Со скидкой</Label>
                    <Badge variant={product.is_discounted ? "outline" : "secondary"}>
                      {product.is_discounted ? "Да" : "Нет"}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Варианты</Label>
                  <p className="text-sm">{product.variants?.length || 0} вариантов</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 