import { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
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
import { Textarea } from '@/components/ui/textarea';
import { LoadingState } from '@/components/ui/loading-state';
import { ApiError } from '@/components/ui/api-error';
import { useApi } from '@/hooks/use-api';
import { productsApi } from '@/services/products-api';
import { categoriesApi } from '@/services/categories-api';
import type { Product, ProductCategory, ProductFormData } from '@/types';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useToggle } from '@/hooks/use-toggle';
import { ProductDetails } from './ProductDetails';

// Компонент для расширяемой строки
const ExpandableRow = ({ product, onDelete, onUpdate }: { 
    product: Product; 
    onDelete: (id: number) => void; 
    onUpdate: () => void;
}) => {
    const [isOpen, toggleOpen] = useToggle(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [formData, setFormData] = useState<ProductFormData>({ ...product });
    const [categories, setCategories] = useState<ProductCategory[]>([]);
  
    const [updateProductState, updateProductActions] = useApi(productsApi.update.bind(productsApi));
    const [deleteProductState] = useApi(productsApi.delete.bind(productsApi));
    
    useEffect(() => {
        // Загрузка категорий для формы редактирования
        categoriesApi.getAll().then(response => setCategories(response));
    }, []);

    const handleUpdate = async () => {
        await updateProductActions.execute(product.id, formData);
        // Обновляем данные в родительском компоненте
        onUpdate();
        setIsSheetOpen(false);
    }
  
    return (
      <Fragment>
        <TableRow>
          <TableCell>
            <Button variant="ghost" size="sm" onClick={toggleOpen}>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </TableCell>
          <TableCell className="font-medium">{product.id}</TableCell>
          <TableCell>{product.name}</TableCell>
          <TableCell>
            <Badge variant="outline">{product.category?.name || 'N/A'}</Badge>
          </TableCell>
          <TableCell>
            {product.is_active ? 
              <CheckCircle className="h-5 w-5 text-green-500" /> : 
              <XCircle className="h-5 w-5 text-red-500" />}
          </TableCell>
          <TableCell>
            <div className="flex items-center justify-end space-x-2">
              <Link to={`/products/${product.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Редактировать товар</SheetTitle>
                    <SheetDescription>
                      Измените информацию о товаре. Варианты и изображения управляются отдельно.
                    </SheetDescription>
                  </SheetHeader>
                  <ProductForm 
                    formData={formData} 
                    setFormData={setFormData}
                    categories={categories}
                    onSubmit={handleUpdate}
                    isLoading={updateProductState.loading}
                    isEdit
                   />
                </SheetContent>
              </Sheet>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Удалить товар?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Вы уверены, что хотите удалить товар "{product.name}"? Это действие нельзя отменить. Все связанные варианты и изображения также будут удалены.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(product.id)}
                      disabled={deleteProductState.loading}
                    >
                      Удалить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TableCell>
        </TableRow>
        {isOpen && (
          <TableRow>
            <TableCell colSpan={6} className="p-0">
              <ProductDetails productId={product.id} />
            </TableCell>
          </TableRow>
        )}
      </Fragment>
    );
};


// Компонент формы для создания/редактирования
const ProductForm = ({ formData, setFormData, categories, onSubmit, isLoading, isEdit = false }: {
    formData: ProductFormData;
    setFormData: (data: ProductFormData) => void;
    categories: ProductCategory[];
    onSubmit: () => void;
    isLoading: boolean;
    isEdit?: boolean;
}) => {
    return (
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Название</Label>
          <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">Описание</Label>
          <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="slug" className="text-right">Слаг</Label>
            <Input id="slug" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">Категория</Label>
          <Select
            value={formData.category_id ? formData.category_id.toString() : ''}
            onValueChange={value => setFormData({...formData, category_id: parseInt(value)})}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Статусы</Label>
          <div className="col-span-3 space-y-2">
            <div className="flex items-center space-x-2">
                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                <Label htmlFor="is_active">Активен</Label>
            </div>
            <div className="flex items-center space-x-2">
                <input type="checkbox" id="is_new" checked={formData.is_new} onChange={e => setFormData({...formData, is_new: e.target.checked})} />
                <Label htmlFor="is_new">Новинка</Label>
            </div>
            <div className="flex items-center space-x-2">
                <input type="checkbox" id="is_discounted" checked={formData.is_discounted} onChange={e => setFormData({...formData, is_discounted: e.target.checked})} />
                <Label htmlFor="is_discounted">Со скидкой</Label>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4">
            <Button onClick={onSubmit} disabled={isLoading}>
                {isLoading ? 'Сохранение...' : (isEdit ? 'Сохранить изменения' : 'Создать товар')}
            </Button>
        </div>
      </div>
    );
};


export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    category_id: 0,
    is_active: true,
    is_new: false,
    is_discounted: false,
  });

  const [getProductsState, getProductsActions] = useApi(productsApi.getAll.bind(productsApi));
  const [getCategoriesState, getCategoriesActions] = useApi(categoriesApi.getAll.bind(categoriesApi));
  const [createProductState, createProductActions] = useApi(productsApi.create.bind(productsApi));

  const loadData = async () => {
    getProductsActions.execute();
    getCategoriesActions.execute();
  };
  
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (getProductsState.data) {
      setProducts(getProductsState.data);
    }
  }, [getProductsState.data]);

  useEffect(() => {
    if (getCategoriesState.data) {
      setCategories(getCategoriesState.data);
    }
  }, [getCategoriesState.data]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = categoryFilter === 'all' || product.category_id.toString() === categoryFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && product.is_active) || (statusFilter === 'inactive' && !product.is_active);
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleCreate = async () => {
    await createProductActions.execute(formData);
    loadData(); // Перезагрузить список
    setIsCreateSheetOpen(false);
    // Сбросить форму
    setFormData({
        name: '', slug: '', description: '', category_id: 0, 
        is_active: true, is_new: false, is_discounted: false
    });
  };

  const handleDelete = async (id: number) => {
    await productsApi.delete(id); // Используем напрямую, так как хук уже есть в строке
    loadData();
  }

  const isLoading = getProductsState.loading || getCategoriesState.loading;
  const error = getProductsState.error || getCategoriesState.error;

  if (isLoading && products.length === 0) {
    return <LoadingState message="Загрузка товаров..." />;
  }

  if (error) {
    return <ApiError error={error} onRetry={loadData} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Товары</h1>
        <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить товар
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[600px]">
            <SheetHeader>
              <SheetTitle>Новый товар</SheetTitle>
              <SheetDescription>
                Заполните основную информацию о товаре. Варианты и изображения можно будет добавить позже.
              </SheetDescription>
            </SheetHeader>
            <ProductForm 
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                onSubmit={handleCreate}
                isLoading={createProductState.loading}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle>Поиск и фильтры</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Input placeholder="Поиск по названию..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Все категории" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {categories.map(cat => <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>)}
            </SelectContent>
          </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Все статусы" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="inactive">Неактивные</SelectItem>
                </SelectContent>
              </Select>
        </CardContent>
      </Card>

      {/* Таблица товаров */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Активен</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <ExpandableRow key={product.id} product={product} onDelete={handleDelete} onUpdate={loadData} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
