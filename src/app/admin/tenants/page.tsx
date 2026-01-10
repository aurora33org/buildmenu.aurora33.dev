'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { TenantStatusBadge } from '@/components/admin/TenantStatusBadge';
import { BandwidthBar } from '@/components/admin/BandwidthBar';
import { RestaurantAvatar } from '@/components/shared/RestaurantAvatar';

interface Tenant {
  id: string;
  email: string;
  name: string;
  restaurant_id: string | null;
  created_at: string;
  restaurant_name: string | null;
  slug: string | null;
  is_active: boolean | null;
  onboarding_completed: boolean | null;
  paused_at: string | null;
  paused_reason: string | null;
  template_id: string | null;
  categories_count: number;
  items_count: number;
  total_views: number;
  views_last_7_days: number;
  bandwidth_30d: number;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const handlePause = async (tenantId: string) => {
    if (!confirm('¿Estás seguro de pausar este tenant? El menú no será accesible.')) {
      return;
    }

    setActionLoading(tenantId);
    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Pausado manualmente por admin' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al pausar tenant');
      }

      await fetchTenants();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al pausar tenant');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpause = async (tenantId: string) => {
    setActionLoading(tenantId);
    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}/unpause`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al despausar tenant');
      }

      await fetchTenants();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al despausar tenant');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTenantStatus = (tenant: Tenant): 'active' | 'paused' | 'pending' | 'inactive' => {
    if (!tenant.restaurant_id) return 'pending';
    if (tenant.paused_at) return 'paused';
    if (tenant.is_active) return 'active';
    return 'inactive';
  };

  const maxBandwidth = Math.max(...tenants.map(t => t.bandwidth_30d || 0), 1024 * 1024);

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
            Gestiona todos los restaurantes del sistema ({tenants.length} total)
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
          {tenants.map((tenant) => {
            const status = getTenantStatus(tenant);
            const isPending = !tenant.restaurant_id;
            const isPaused = !!tenant.paused_at;

            return (
              <Card key={tenant.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {tenant.restaurant_name && (
                        <RestaurantAvatar name={tenant.restaurant_name} size="lg" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle>
                            {tenant.restaurant_name || tenant.name}
                          </CardTitle>
                          <TenantStatusBadge status={status} />
                        </div>
                        {tenant.slug && (
                          <CardDescription className="mt-1">
                            /{tenant.slug}
                          </CardDescription>
                        )}
                        {isPending && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Usuario: {tenant.name} ({tenant.email})
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      {tenant.slug && (
                        <Button asChild variant="outline" size="sm">
                          <a href={`/${tenant.slug}`} target="_blank" rel="noopener noreferrer">
                            Ver Menú
                          </a>
                        </Button>
                      )}
                      {!isPending && (
                        <>
                          {isPaused ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleUnpause(tenant.id)}
                              disabled={actionLoading === tenant.id}
                            >
                              {actionLoading === tenant.id ? 'Procesando...' : 'Reactivar'}
                            </Button>
                          ) : (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handlePause(tenant.id)}
                              disabled={actionLoading === tenant.id}
                            >
                              {actionLoading === tenant.id ? 'Procesando...' : 'Pausar'}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {!isPending && (
                  <CardContent>
                    <div className="space-y-4">
                      {/* Restaurant Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Usuario</p>
                          <p className="font-medium">{tenant.name}</p>
                          <p className="text-xs text-muted-foreground">{tenant.email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Template</p>
                          <p className="font-medium capitalize">{tenant.template_id || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Contenido</p>
                          <p className="font-medium">
                            {tenant.categories_count} categorías, {tenant.items_count} items
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Creado</p>
                          <p className="font-medium">{formatDate(tenant.created_at)}</p>
                        </div>
                      </div>

                      {/* Analytics */}
                      <div className="space-y-3 pt-3 border-t">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Visitas Totales</p>
                            <p className="font-semibold text-lg">{tenant.total_views}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Últimos 7 Días</p>
                            <p className="font-semibold text-lg">{tenant.views_last_7_days}</p>
                          </div>
                          <div className="col-span-2 md:col-span-1">
                            <p className="text-muted-foreground mb-2">Bandwidth (30d)</p>
                            <BandwidthBar bytes={tenant.bandwidth_30d} maxBytes={maxBandwidth} />
                          </div>
                        </div>
                      </div>

                      {/* Pause Reason */}
                      {isPaused && tenant.paused_reason && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm text-yellow-900">
                            <span className="font-semibold">Razón: </span>
                            {tenant.paused_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}

                {isPending && (
                  <CardContent>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900">
                        Este usuario aún no ha completado el onboarding. Al iniciar sesión, será redirigido automáticamente al wizard de configuración.
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
