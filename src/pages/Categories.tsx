import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Plus, Edit, Trash2, Search, Tag, Loader2 } from 'lucide-react';

export function Categories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
  });

  // API хуки
  const [getCategoriesState, getCategoriesActions] = useApi(categoriesApi.getAll.bind(categoriesApi));
  const [createCategoryState, createCategoryActions] = useApi(categoriesApi.create.bind(categoriesApi));
  const [updateCategoryState, updateCategoryActions] = useApi(categoriesApi.update.bind(categoriesApi));
  const [deleteCategoryState, deleteCategoryActions] = useApi(categoriesApi.delete.bind(categoriesApi));

  // Загрузка категорий при монтировании
  useEffect(() => {
    loadCategories();
  }, []);

  // Обновление локального состояния при получении данных
  useEffect(() => {
    if (getCategoriesState.data) {
      setCategories(getCategoriesState.data);
    }
  }, [getCategoriesState.data]);

  const loadCategories = async () => {
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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[а-я]/g, (char) => {
        const map: Record<string, string> = {
          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
          'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
          'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
          'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
          'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        return map[char] || char;
      })
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleCreate = async () => {
    try {
      const newCategory = await createCategoryActions.execute(formData);
    setCategories([...categories, newCategory]);
      setFormData({ name: '', slug: '' });
    setIsCreateOpen(false);
    } catch (error) {
      console.error('Ошибка создания категории:', error);
    }
  };

  const handleEdit = (category: ProductCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;

    try {
      const updatedCategory = await updateCategoryActions.execute(editingCategory.id, formData);
      setCategories(categories.map(category =>
        category.id === editingCategory.id ? updatedCategory : category
      ));
      setFormData({ name: '', slug: '' });
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
        <Label htmlFor="name">Название</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => {
            const name = e.target.value;
            setFormData({
              ...formData,
              name,
              slug: formData.slug || generateSlug(name)
            });
          }}
          placeholder="Введите название категории"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="category-slug"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => {
            setFormData({ name: '', slug: '' });
            isEdit ? setIsEditOpen(false) : setIsCreateOpen(false);
          }}
        >
          Отмена
        </Button>
        <Button 
          onClick={isEdit ? handleUpdate : handleCreate}
          disabled={createCategoryState.loading || updateCategoryState.loading}
        >
          {(createCategoryState.loading || updateCategoryState.loading) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isEdit ? 'Обновить' : 'Создать'}
        </Button>
      </div>
    </div>
  );

  if (getCategoriesState.loading) {
    return <LoadingState message="Загрузка категорий..." />;
  }

  if (getCategoriesState.error) {
    return (
      <ApiError 
        error={getCategoriesState.error} 
        onRetry={loadCategories}
        title="Ошибка загрузки категорий"
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Tag className="h-8 w-8 text-blue-600" />
            <span>Категории</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Управление категориями товаров
          </p>
        </div>

        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Добавить категорию
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Создать категорию</SheetTitle>
              <SheetDescription>
                Заполните информацию для новой категории товаров
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <CategoryForm />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего категорий</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Поиск по названию или slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
              />
            </div>
          </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Список категорий</CardTitle>
          <CardDescription>
            Все категории товаров в системе
          </CardDescription>
        </CardHeader>
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
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {category.slug}
                    </code>
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
                              Измените информацию о категории
                            </SheetDescription>
                          </SheetHeader>
                          <div className="mt-6">
                            <CategoryForm isEdit />
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
                            <AlertDialogTitle>Удалить категорию</AlertDialogTitle>
                            <AlertDialogDescription>
                              Вы уверены, что хотите удалить категорию "{category.name}"? 
                              Это действие нельзя отменить.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(category.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deleteCategoryState.loading}
                            >
                              {deleteCategoryState.loading && (
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
