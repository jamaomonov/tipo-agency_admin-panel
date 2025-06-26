import { useState, useCallback, useRef, useLayoutEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useApi } from '@/hooks/use-api';
import { variantsApi } from '@/services/variants-api';
import type { Product, ProductVariant, ProductVariantFormData } from '@/types';
import { Plus, Edit, Trash2, Image as ImageIcon, Package } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { VariantImageManager } from '@/components/VariantImageManager';
import { Badge } from '@/components/ui/badge';

// Форма для варианта
const VariantForm = ({ formData, setFormData, onSubmit, isLoading, isEdit = false }: {
    formData: ProductVariantFormData;
    setFormData: (data: ProductVariantFormData) => void;
    onSubmit: () => void;
    isLoading: boolean;
    isEdit?: boolean;
}) => (
    <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="color" className="text-right">Цвет</Label>
            <Input id="color" value={formData.color || ''} onChange={e => setFormData({ ...formData, color: e.target.value })} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="size" className="text-right">Размер</Label>
            <Input id="size" value={formData.size || ''} onChange={e => setFormData({ ...formData, size: e.target.value })} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="material" className="text-right">Материал</Label>
            <Input id="material" value={formData.material || ''} onChange={e => setFormData({ ...formData, material: e.target.value })} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">Цена</Label>
            <Input id="price" type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock" className="text-right">Остаток</Label>
            <Input id="stock" type="number" value={formData.stock_quantity} onChange={e => setFormData({ ...formData, stock_quantity: Number(e.target.value) })} className="col-span-3" />
        </div>
        <div className="flex justify-end pt-4">
            <Button onClick={onSubmit} disabled={isLoading}>
                {isLoading ? 'Сохранение...' : (isEdit ? 'Сохранить' : 'Создать')}
            </Button>
        </div>
    </div>
);


export function VariantManager({ product, variants, onVariantsChange }: { 
    product: Product; 
    variants: ProductVariant[];
    onVariantsChange: () => void; 
}) {
    const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [isImagesSheetOpen, setIsImagesSheetOpen] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

    const [createForm, setCreateForm] = useState<ProductVariantFormData>({
        product_id: product.id,
        color: '',
        size: '',
        material: '',
        price: 0,
        stock_quantity: 0,
    });

    const [editForm, setEditForm] = useState<ProductVariantFormData>({
        product_id: product.id,
        color: '',
        size: '',
        material: '',
        price: 0,
        stock_quantity: 0,
    });

    // Используем ref для сохранения состояния Sheet
    const imagesSheetOpenRef = useRef(false);
    const selectedVariantIdRef = useRef<number | null>(null);

    // Синхронизируем состояние с ref
    useLayoutEffect(() => {
        imagesSheetOpenRef.current = isImagesSheetOpen;
    }, [isImagesSheetOpen]);

    useLayoutEffect(() => {
        selectedVariantIdRef.current = selectedVariant?.id || null;
    }, [selectedVariant]);

    const [createState, createActions] = useApi(variantsApi.create.bind(variantsApi));
    const [updateState, updateActions] = useApi(variantsApi.update.bind(variantsApi));
    const [deleteState, deleteActions] = useApi(variantsApi.delete.bind(variantsApi));

    const handleCreate = async () => {
        try {
            await createActions.execute(createForm);
            // Обновляем данные после успешного создания
            onVariantsChange();
            setIsCreateSheetOpen(false);
            // Сбрасываем форму
            setCreateForm({
                product_id: product.id,
                color: '',
                size: '',
                material: '',
                price: 0,
                stock_quantity: 0,
            });
        } catch (error) {
            console.error('Ошибка при создании варианта:', error);
        }
    };

    const handleEditClick = (variant: ProductVariant) => {
        setEditForm({
            product_id: variant.product_id,
            color: variant.color || '',
            size: variant.size || '',
            material: variant.material || '',
            price: variant.price,
            stock_quantity: variant.stock_quantity,
        });
        setIsEditSheetOpen(true);
    };

    const handleImagesClick = (variant: ProductVariant) => {
        setSelectedVariant(variant);
        setIsImagesSheetOpen(true);
    };

    const handleUpdate = async () => {
        if (!selectedVariant) return;
        try {
            await updateActions.execute(selectedVariant.id, editForm);
            // Обновляем данные после успешного обновления
            onVariantsChange();
            setIsEditSheetOpen(false);
        } catch (error) {
            console.error('Ошибка при обновлении варианта:', error);
        }
    };

    const handleDelete = async (variantId: number) => {
        try {
            await deleteActions.execute(variantId);
            // Обновляем данные после успешного удаления
            onVariantsChange();
        } catch (error) {
            console.error('Ошибка при удалении варианта:', error);
            // Можно добавить уведомление об ошибке
        }
    };

    // Мемоизируем функцию обновления изображений
    const handleImagesChange = useCallback(() => {
        // Сохраняем текущее состояние
        const wasOpen = imagesSheetOpenRef.current;
        const currentVariantId = selectedVariantIdRef.current;
        
        // Обновляем данные вариантов
        onVariantsChange();
        
        // Восстанавливаем состояние Sheet если он был открыт
        if (wasOpen && currentVariantId) {
            // Используем requestAnimationFrame для более быстрого обновления
            requestAnimationFrame(() => {
                const updatedVariant = variants.find(v => v.id === currentVariantId);
                if (updatedVariant) {
                    setSelectedVariant(updatedVariant);
                    // Принудительно открываем Sheet если он был закрыт
                    if (!isImagesSheetOpen) {
                        setIsImagesSheetOpen(true);
                    }
                }
            });
        }
    }, [onVariantsChange, variants, isImagesSheetOpen]);

    // Функция для безопасного закрытия Sheet с изображениями
    const handleCloseImagesSheet = useCallback(() => {
        setIsImagesSheetOpen(false);
        setSelectedVariant(null);
    }, []);

    // Мемоизируем VariantImageManager чтобы предотвратить его пересоздание
    const memoizedVariantImageManager = useMemo(() => {
        if (!selectedVariant) return null;
        
        return (
            <VariantImageManager 
                key={`variant-images-${selectedVariant.id}`}
                variant={selectedVariant}
                onImagesChange={handleImagesChange}
            />
        );
    }, [selectedVariant?.id, handleImagesChange]);

    return (
        <div className="p-4 border rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Варианты товара</h4>
                <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" />Добавить вариант</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Новый вариант для "{product.name}"</SheetTitle>
                            <SheetDescription>
                                Заполните характеристики нового варианта.
                            </SheetDescription>
                        </SheetHeader>
                        <VariantForm
                            formData={createForm}
                            setFormData={setCreateForm}
                            onSubmit={handleCreate}
                            isLoading={createState.loading}
                        />
                    </SheetContent>
                </Sheet>
            </div>
            
            {variants.length === 0 ? (
                <div className="text-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium text-gray-900">У этого товара нет вариантов</h3>
                            <p className="text-gray-500 max-w-sm">
                                Варианты позволяют создавать разные модификации товара (цвет, размер, материал и т.д.)
                            </p>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setIsCreateSheetOpen(true)}
                            className="mt-4"
                            disabled={createState.loading}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            {createState.loading ? 'Создание...' : 'Создать первый вариант'}
                        </Button>
                    </div>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Цвет</TableHead>
                            <TableHead>Размер</TableHead>
                            <TableHead>Материал</TableHead>
                            <TableHead>Цена</TableHead>
                            <TableHead>Остаток</TableHead>
                            <TableHead>Изображения</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {variants.map(variant => (
                            <TableRow key={variant.id}>
                                <TableCell>{variant.color || '-'}</TableCell>
                                <TableCell>{variant.size || '-'}</TableCell>
                                <TableCell>{variant.material || '-'}</TableCell>
                                <TableCell>{variant.price.toLocaleString('ru-RU')} UZS</TableCell>
                                <TableCell>{variant.stock_quantity}</TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className="text-xs">
                                            {variant.images?.length || 0} шт.
                                        </Badge>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => handleImagesClick(variant)}
                                        >
                                            <ImageIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(variant)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Удалить вариант?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Вы уверены, что хотите удалить вариант? Это действие нельзя отменить.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(variant.id)} disabled={deleteState.loading}>
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
            )}

            {/* Модальное окно для редактирования */}
            <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Редактировать вариант</SheetTitle>
                    </SheetHeader>
                    <VariantForm
                        formData={editForm}
                        setFormData={setEditForm}
                        onSubmit={handleUpdate}
                        isLoading={updateState.loading}
                        isEdit
                    />
                </SheetContent>
            </Sheet>

            {/* Модальное окно для управления изображениями */}
            <Sheet 
                open={isImagesSheetOpen} 
                onOpenChange={handleCloseImagesSheet}
                key={`images-sheet-${selectedVariant?.id || 'none'}`}
            >
                <SheetContent className="w-full sm:w-[800px] sm:max-w-[800px] !w-full sm:!w-[800px] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            Управление изображениями
                            {selectedVariant && (
                                <span className="text-sm font-normal text-gray-500 ml-2">
                                    Вариант: {selectedVariant.color || selectedVariant.size || 'Без названия'}
                                </span>
                            )}
                        </SheetTitle>
                        <SheetDescription>
                            Загружайте, редактируйте и удаляйте изображения для выбранного варианта товара.
                        </SheetDescription>
                    </SheetHeader>
                    {selectedVariant && (
                        <div className="mt-6">
                            {memoizedVariantImageManager}
                        </div>
                    )}
                </SheetContent>
            </Sheet>

        </div>
    );
} 