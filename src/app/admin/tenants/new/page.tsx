'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Label } from '@/components/shared/ui/label';
import { Textarea } from '@/components/shared/ui/textarea';
import { Select } from '@/components/shared/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/ui/card';

export default function NewTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Restaurant
    restaurantName: '',
    slug: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    // User
    userName: '',
    userEmail: '',
    password: '',
    confirmPassword: '',
    // Settings
    templateId: 'classic' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantName: formData.restaurantName,
          slug: formData.slug,
          description: formData.description || undefined,
          contactEmail: formData.contactEmail || undefined,
          contactPhone: formData.contactPhone || undefined,
          address: formData.address || undefined,
          userName: formData.userName,
          userEmail: formData.userEmail,
          password: formData.password,
          templateId: formData.templateId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear tenant');
      }

      // Redirect to tenants list
      router.push('/admin/tenants');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear tenant');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate slug from restaurant name
  const handleRestaurantNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      restaurantName: value,
      slug: prev.slug === '' ? value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : prev.slug,
    }));
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Crear Nuevo Tenant</h1>
        <p className="text-muted-foreground mt-2">
          Crea un nuevo restaurante con su usuario asociado
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Restaurant Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Restaurante</CardTitle>
            <CardDescription>
              Datos del negocio que aparecerán en el menú público
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="restaurantName">Nombre del Restaurante *</Label>
                <Input
                  id="restaurantName"
                  value={formData.restaurantName}
                  onChange={(e) => handleRestaurantNameChange(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Ej: Restaurante El Buen Sabor"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  required
                  disabled={loading}
                  placeholder="el-buen-sabor"
                  pattern="[a-z0-9-]+"
                />
                <p className="text-xs text-muted-foreground">
                  URL pública: /{formData.slug || 'slug'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={loading}
                placeholder="Breve descripción del restaurante..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email de Contacto</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  disabled={loading}
                  placeholder="contacto@restaurante.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Teléfono</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  disabled={loading}
                  placeholder="+52 123 456 7890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                disabled={loading}
                placeholder="Calle Principal #123, Ciudad"
              />
            </div>
          </CardContent>
        </Card>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>Usuario del Restaurante</CardTitle>
            <CardDescription>
              Credenciales de acceso para el dueño del restaurante
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Nombre del Usuario *</Label>
              <Input
                id="userName"
                value={formData.userName}
                onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                required
                disabled={loading}
                placeholder="Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userEmail">Email (Login) *</Label>
              <Input
                id="userEmail"
                type="email"
                value={formData.userEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, userEmail: e.target.value }))}
                required
                disabled={loading}
                placeholder="juan@restaurante.com"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  disabled={loading}
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  disabled={loading}
                  minLength={8}
                  placeholder="Repetir contraseña"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración Inicial</CardTitle>
            <CardDescription>
              Template visual para el menú público
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateId">Template Inicial</Label>
              <Select
                id="templateId"
                value={formData.templateId}
                onChange={(e) => setFormData(prev => ({ ...prev, templateId: e.target.value as any }))}
                disabled={loading}
              >
                <option value="classic">Classic - Tradicional y elegante</option>
                <option value="modern">Modern - Contemporáneo y vibrante</option>
                <option value="elegant">Elegant - Fine dining sofisticado</option>
                <option value="minimal">Minimal - Limpio y minimalista</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Error message */}
        {error && (
          <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Tenant'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/tenants')}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
