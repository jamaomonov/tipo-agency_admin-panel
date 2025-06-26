import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { categoriesApi } from '@/services/categories-api';
import type { ProductCategory, CategoryFormData } from '@/types';
import { Plus, Edit, Trash2, Search, FolderOpen } from 'lucide-react';
import { categoryFormToCreate, categoryFormToUpdate, validateCategoryName, getFieldError, hasFieldError } from '@/lib/utils';

export function Categories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // API хуки
  const [getCategoriesState, getCategoriesActions] = useApi(categoriesApi.getAll.bind(categoriesApi));
  const [createCategoryState, createCategoryActions] = useApi(categoriesApi.create.bind(categoriesApi));
  const [updateCategoryState, updateCategoryActions] = useApi(categoriesApi.update.bind(categoriesApi));
  const [deleteCategoryState, deleteCategoryActions] = useApi(categoriesApi.delete.bind(categoriesApi));

  // Загрузка данных при монтировании
  useEffect(() => {
    loadData();
  }, []);

  // Обновление локального состояния при получении данных
  useEffect(() => {
    if (getCategoriesState.data) {
      setCategories(getCategoriesState.data);
    }
  }, [getCategoriesState.data]);

  const loadData = async () => {
    try {
      await getCategoriesActions.execute();
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!validateCategoryName(formData.name)) {
      errors.name = 'Название должно содержать от 2 до 100 символов';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    
    try {
      const createData = categoryFormToCreate(formData);
      const newCategory = await createCategoryActions.execute(createData);
      setCategories([...categories, newCategory]);
      setFormData({ name: '' });
      setFormErrors({});
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Ошибка создания категории:', error);
    }
  };

  const handleEdit = (category: ProductCategory) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingCategory || !validateForm()) return;

    try {
      const updateData = categoryFormToUpdate(formData);
      const updatedCategory = await updateCategoryActions.execute(editingCategory.id, updateData);
      setCategories(categories.map(category =>
        category.id === editingCategory.id ? updatedCategory : category
      ));
      setFormData({ name: '' });
      setFormErrors({});
      setEditingCategory(null);
      setIsEditOpen(false);
    } catch (error) {
      console.error('Ошибка обновления категории:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategoryActions.execute(id);
      setCategories(categories.filter(category => category.id !== id));
    } catch (error) {
      console.error('Ошибка удаления категории:', error);
    }
  };

  const CategoryForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Название категории</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Например: Одежда, Электроника, Книги"
          className={hasFieldError('name', formErrors) ? 'border-red-500' : ''}
        />
        {getFieldError('name', formErrors) && (
          <p className="text-sm text-red-500">{getFieldError('name', formErrors)}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={() => isEdit ? setIsEditOpen(false) : setIsCreateOpen(false)}>
          Отмена
        </Button>
        <Button 
          onClick={isEdit ? handleUpdate : handleCreate}
          disabled={isEdit ? updateCategoryState.loading : createCategoryState.loading}
        >
          {isEdit ? 'Сохранить' : 'Создать'}
        </Button>
      </div>
    </div>
  );

  const isLoading = getCategoriesState.loading;
  const error = getCategoriesState.error;

  if (isLoading && categories.length === 0) {
    return <LoadingState message="Загрузка категорий..." />;
  }

  if (error) {
    return <ApiError error={error} onRetry={loadData} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Категории товаров</h1>
          <p className="text-gray-600">Управление категориями для организации товаров</p>
        </div>
        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить категорию
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Новая категория</SheetTitle>
              <SheetDescription>
                Создайте новую категорию для организации товаров.
              </SheetDescription>
            </SheetHeader>
            <CategoryForm />
          </SheetContent>
        </Sheet>
      </div>

      {/* Поиск */}
      <Card>
        <CardHeader>
          <CardTitle>Поиск категорий</CardTitle>
        </CardHeader>
        <CardContent>
          <Input 
            placeholder="Поиск по названию или slug..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Таблица категорий */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <FolderOpen className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {category.slug}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <SheetTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>Редактировать категорию</SheetTitle>
                            <SheetDescription>
                              Измените название категории.
                            </SheetDescription>
                          </SheetHeader>
                          <CategoryForm isEdit />
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
                            <AlertDialogTitle>Удалить категорию?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Вы уверены, что хотите удалить категорию "{category.name}"? Это действие нельзя отменить. Все товары в этой категории останутся без категории.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(category.id)}
                              disabled={deleteCategoryState.loading}
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

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Всего категорий</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Search className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Найдено</p>
                <p className="text-2xl font-bold">{filteredCategories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Edit className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Доступно для редактирования</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
