'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Label } from '@/components/shared/ui/label';
import { Textarea } from '@/components/shared/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/ui/card';
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
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage, handleApiError } from '@/lib/utils/error-handler';

interface Category {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_visible: boolean;
  items_count: number;
}

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  base_price: number | null;
  display_order: number;
  is_visible: boolean;
  is_featured: boolean;
  category_name: string;
}

function SortableCategory({
  category,
  onAddItem,
  onEditCategory,
  onDeleteCategory,
  isDeleting,
  children,
}: {
  category: Category;
  onAddItem: () => void;
  onEditCategory: () => void;
  onDeleteCategory: () => void;
  isDeleting: boolean;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <button
                className="mt-1 cursor-grab active:cursor-grabbing touch-none"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="flex-1">
                <CardTitle>{category.name}</CardTitle>
                {category.description && (
                  <CardDescription className="mt-1">{category.description}</CardDescription>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {category.items_count} items
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={onAddItem}>
                Agregar Item
              </Button>
              <Button size="sm" variant="outline" onClick={onEditCategory}>
                Editar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Está a punto de eliminar la categoría <strong>{category.name}</strong> y todos sus items ({category.items_count}).
                      Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDeleteCategory}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

function SortableItem({
  item,
  onEdit,
  onDelete,
  isDeleting,
}: {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start justify-between p-3 border rounded-md bg-background"
    >
      <div className="flex items-start gap-3 flex-1">
        <button
          className="mt-1 cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <p className="font-medium">{item.name}</p>
          {item.description && (
            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
          )}
          {item.base_price !== null && (
            <p className="text-sm font-medium mt-1">
              ${item.base_price.toFixed(2)}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={onEdit}>
          Editar
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar item?</AlertDialogTitle>
              <AlertDialogDescription>
                Está a punto de eliminar el item <strong>{item.name}</strong>.
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default function MenuEditorPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  const [itemForm, setItemForm] = useState({
    categoryId: '',
    name: '',
    description: '',
    basePrice: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        fetch('/api/menu/categories'),
        fetch('/api/menu/items'),
      ]);

      if (!categoriesRes.ok || !itemsRes.ok) {
        throw new Error('Failed to fetch menu data');
      }

      const categoriesData = await categoriesRes.json();
      const itemsData = await itemsRes.json();

      setCategories(categoriesData.categories || []);
      setItems(itemsData.items || []);
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/menu/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryForm.name,
          description: categoryForm.description || undefined,
        }),
      });

      if (response.ok) {
        setCategoryForm({ name: '', description: '' });
        setShowCategoryForm(false);
        fetchData();
        toast({
          title: "Éxito",
          description: "Categoría creada correctamente",
        });
      } else {
        const errorMessage = await handleApiError(response);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/menu/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: itemForm.categoryId,
          name: itemForm.name,
          description: itemForm.description || undefined,
          basePrice: itemForm.basePrice ? parseFloat(itemForm.basePrice) : null,
        }),
      });

      if (response.ok) {
        setItemForm({ categoryId: '', name: '', description: '', basePrice: '' });
        setShowItemForm(false);
        fetchData();
        toast({
          title: "Éxito",
          description: "Item creado correctamente",
        });
      } else {
        const errorMessage = await handleApiError(response);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setDeletingCategoryId(id);

    try {
      const response = await fetch(`/api/menu/categories/${id}`, { method: 'DELETE' });

      if (response.ok) {
        fetchData();
        toast({
          title: "Éxito",
          description: "Categoría eliminada correctamente",
        });
      } else {
        const errorMessage = await handleApiError(response);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const handleDeleteItem = async (id: string) => {
    setDeletingItemId(id);

    try {
      const response = await fetch(`/api/menu/items/${id}`, { method: 'DELETE' });

      if (response.ok) {
        fetchData();
        toast({
          title: "Éxito",
          description: "Item eliminado correctamente",
        });
      } else {
        const errorMessage = await handleApiError(response);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
    });
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const response = await fetch(`/api/menu/categories/${editingCategory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryForm.name,
          description: categoryForm.description || undefined,
        }),
      });

      if (response.ok) {
        setCategoryForm({ name: '', description: '' });
        setEditingCategory(null);
        fetchData();
        toast({
          title: "Éxito",
          description: "Categoría actualizada correctamente",
        });
      } else {
        const errorMessage = await handleApiError(response);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      categoryId: item.category_id,
      name: item.name,
      description: item.description || '',
      basePrice: item.base_price !== null ? item.base_price.toString() : '',
    });
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const response = await fetch(`/api/menu/items/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: itemForm.name,
          description: itemForm.description || undefined,
          basePrice: itemForm.basePrice ? parseFloat(itemForm.basePrice) : null,
        }),
      });

      if (response.ok) {
        setItemForm({ categoryId: '', name: '', description: '', basePrice: '' });
        setEditingItem(null);
        fetchData();
        toast({
          title: "Éxito",
          description: "Item actualizado correctamente",
        });
      } else {
        const errorMessage = await handleApiError(response);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleDragEndCategories = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);

      const newCategories = arrayMove(categories, oldIndex, newIndex);
      setCategories(newCategories);

      // Update server
      try {
        await fetch('/api/menu/categories/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoryIds: newCategories.map(cat => cat.id),
          }),
        });
      } catch (error) {
        console.error('Error reordering categories:', error);
        // Revert on error
        fetchData();
      }
    }
  };

  const handleDragEndItems = async (event: DragEndEvent, categoryId: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const categoryItems = getItemsByCategory(categoryId);
      const oldIndex = categoryItems.findIndex((item) => item.id === active.id);
      const newIndex = categoryItems.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(categoryItems, oldIndex, newIndex);

      // Update local state
      setItems((prevItems) => {
        const otherItems = prevItems.filter(item => item.category_id !== categoryId);
        return [...otherItems, ...newItems];
      });

      // Update server
      try {
        await fetch('/api/menu/items/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoryId,
            itemIds: newItems.map(item => item.id),
          }),
        });
      } catch (error) {
        console.error('Error reordering items:', error);
        // Revert on error
        fetchData();
      }
    }
  };

  const getItemsByCategory = (categoryId: string) => {
    return items.filter(item => item.category_id === categoryId)
      .sort((a, b) => a.display_order - b.display_order);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando menú...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Editor de Menú</h1>
          <p className="text-muted-foreground mt-2">
            Arrastra para reordenar categorías e items
          </p>
        </div>
        <Button onClick={() => setShowCategoryForm(true)}>
          Agregar Categoría
        </Button>
      </div>

      {/* Category Form */}
      {showCategoryForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Nombre *</Label>
                <Input
                  id="categoryName"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Ej: Platillos Principales"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryDesc">Descripción</Label>
                <Textarea
                  id="categoryDesc"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción opcional..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Crear Categoría</Button>
                <Button type="button" variant="outline" onClick={() => setShowCategoryForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Edit Category Form */}
      {editingCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Editar Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editCategoryName">Nombre *</Label>
                <Input
                  id="editCategoryName"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Ej: Platillos Principales"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCategoryDesc">Descripción</Label>
                <Textarea
                  id="editCategoryDesc"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción opcional..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Guardar Cambios</Button>
                <Button type="button" variant="outline" onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: '', description: '' });
                }}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories & Items */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No hay categorías todavía. Crea una para empezar.
            </p>
            <Button onClick={() => setShowCategoryForm(true)}>
              Crear Primera Categoría
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEndCategories}
        >
          <SortableContext
            items={categories.map(cat => cat.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {categories.map((category) => (
                <SortableCategory
                  key={category.id}
                  category={category}
                  onAddItem={() => {
                    setItemForm(prev => ({ ...prev, categoryId: category.id }));
                    setShowItemForm(true);
                  }}
                  onEditCategory={() => handleEditCategory(category)}
                  onDeleteCategory={() => handleDeleteCategory(category.id)}
                  isDeleting={deletingCategoryId === category.id}
                >
                  {getItemsByCategory(category.id).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay items en esta categoría
                    </p>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleDragEndItems(event, category.id)}
                    >
                      <SortableContext
                        items={getItemsByCategory(category.id).map(item => item.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {getItemsByCategory(category.id).map((item) => (
                            <SortableItem
                              key={item.id}
                              item={item}
                              onEdit={() => handleEditItem(item)}
                              onDelete={() => handleDeleteItem(item.id)}
                              isDeleting={deletingItemId === item.id}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </SortableCategory>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Item Form Modal */}
      {showItemForm && (
        <Card className="fixed inset-x-4 top-20 max-w-2xl mx-auto z-50 shadow-lg">
          <CardHeader>
            <CardTitle>Nuevo Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">Nombre *</Label>
                <Input
                  id="itemName"
                  value={itemForm.name}
                  onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Ej: Tacos al Pastor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemDesc">Descripción</Label>
                <Textarea
                  id="itemDesc"
                  value={itemForm.description}
                  onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del platillo..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemPrice">Precio</Label>
                <Input
                  id="itemPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={itemForm.basePrice}
                  onChange={(e) => setItemForm(prev => ({ ...prev, basePrice: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Crear Item</Button>
                <Button type="button" variant="outline" onClick={() => setShowItemForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Edit Item Form Modal */}
      {editingItem && (
        <Card className="fixed inset-x-4 top-20 max-w-2xl mx-auto z-50 shadow-lg">
          <CardHeader>
            <CardTitle>Editar Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateItem} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editItemName">Nombre *</Label>
                <Input
                  id="editItemName"
                  value={itemForm.name}
                  onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Ej: Tacos al Pastor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editItemDesc">Descripción</Label>
                <Textarea
                  id="editItemDesc"
                  value={itemForm.description}
                  onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del platillo..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editItemPrice">Precio</Label>
                <Input
                  id="editItemPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={itemForm.basePrice}
                  onChange={(e) => setItemForm(prev => ({ ...prev, basePrice: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Guardar Cambios</Button>
                <Button type="button" variant="outline" onClick={() => {
                  setEditingItem(null);
                  setItemForm({ categoryId: '', name: '', description: '', basePrice: '' });
                }}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Overlay for modal */}
      {(showItemForm || editingItem) && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => {
            setShowItemForm(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}
