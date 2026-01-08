'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/ui/card';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  user_email: string;
  user_name: string;
  template_id: string;
  categories_count: number;
  items_count: number;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/admin/tenants');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar tenants');
      }

      setTenants(data.tenants);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tenants');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando tenants...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tenants</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona todos los restaurantes del sistema
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/tenants/new">Crear Nuevo Tenant</Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      {tenants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No hay tenants creados todavía
            </p>
            <Button asChild>
              <Link href="/admin/tenants/new">Crear Primer Tenant</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tenants.map((tenant) => (
            <Card key={tenant.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {tenant.name}
                      {!tenant.is_active && (
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          Inactivo
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      /{tenant.slug}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a href={`/${tenant.slug}`} target="_blank" rel="noopener noreferrer">
                        Ver Menú Público
                      </a>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Usuario</p>
                    <p className="font-medium">{tenant.user_name}</p>
                    <p className="text-xs text-muted-foreground">{tenant.user_email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Template</p>
                    <p className="font-medium capitalize">{tenant.template_id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Menú</p>
                    <p className="font-medium">
                      {tenant.categories_count} categorías, {tenant.items_count} items
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Creado</p>
                    <p className="font-medium">{formatDate(tenant.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
