import { useState } from 'react';
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
import { Plus, Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

    const [createForm, setCreateForm] = useState<ProductVariantFormData>({
        product_id: product.id,
        price: 0,
        stock_quantity: 0,
        color: '',
        size: '',
        material: '',
    });

    const [editForm, setEditForm] = useState<ProductVariantFormData>({
        product_id: product.id,
        price: 0,
        stock_quantity: 0,
        color: '',
        size: '',
        material: '',
    });

    const [createState, createActions] = useApi(variantsApi.create.bind(variantsApi));
    const [updateState, updateActions] = useApi(variantsApi.update.bind(variantsApi));
    const [deleteState, deleteActions] = useApi(variantsApi.delete.bind(variantsApi));

    const handleCreate = async () => {
        const newVariant = await createActions.execute(createForm);
        onVariantsChange();
        setIsCreateSheetOpen(false);
    };

    const handleEditClick = (variant: ProductVariant) => {
        setSelectedVariant(variant);
        setEditForm({
            product_id: variant.product_id,
            price: variant.price,
            stock_quantity: variant.stock_quantity,
            color: variant.color || '',
            size: variant.size || '',
            material: variant.material || '',
        });
        setIsEditSheetOpen(true);
    };

    const handleUpdate = async () => {
        if (!selectedVariant) return;
        const updatedVariant = await updateActions.execute(selectedVariant.id, editForm);
        onVariantsChange();
        setIsEditSheetOpen(false);
    };

    const handleDelete = async (variantId: number) => {
        await deleteActions.execute(variantId);
        onVariantsChange();
    };

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
            
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Цвет</TableHead>
                        <TableHead>Размер</TableHead>
                        <TableHead>Материал</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead>Остаток</TableHead>
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

        </div>
    );
} 