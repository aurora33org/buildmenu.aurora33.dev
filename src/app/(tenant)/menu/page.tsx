'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Label } from '@/components/shared/ui/label';
import { Textarea } from '@/components/shared/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/ui/card';

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

export default function MenuEditorPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  // Item form state
  const [itemForm, setItemForm] = useState({
    categoryId: '',
    name: '',
    description: '',
    basePrice: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        fetch('/api/menu/categories'),
        fetch('/api/menu/items'),
      ]);

      const categoriesData = await categoriesRes.json();
      const itemsData = await itemsRes.json();

      setCategories(categoriesData.categories || []);
      setItems(itemsData.items || []);
    } catch (error) {
      console.error('Error fetching data:', error);
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
      }
    } catch (error) {
      console.error('Error creating category:', error);
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
      }
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría y todos sus items?')) return;

    try {
      await fetch(`/api/menu/categories/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('¿Eliminar este item?')) return;

    try {
      await fetch(`/api/menu/items/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const getItemsByCategory = (categoryId: string) => {
    return items.filter(item => item.category_id === categoryId);
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
            Gestiona las categorías y platillos de tu menú
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
        <div className="space-y-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{category.name}</CardTitle>
                    {category.description && (
                      <CardDescription className="mt-1">{category.description}</CardDescription>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      {category.items_count} items
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setItemForm(prev => ({ ...prev, categoryId: category.id }));
                        setShowItemForm(true);
                      }}
                    >
                      Agregar Item
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {getItemsByCategory(category.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay items en esta categoría
                  </p>
                ) : (
                  <div className="space-y-2">
                    {getItemsByCategory(category.id).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between p-3 border rounded-md"
                      >
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
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
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

      {/* Overlay for modal */}
      {showItemForm && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowItemForm(false)}
        />
      )}
    </div>
  );
}
