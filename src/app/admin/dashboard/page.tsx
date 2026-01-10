'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { BandwidthBar } from '@/components/admin/BandwidthBar';
import Link from 'next/link';

interface AnalyticsData {
  kpis: {
    totalTenants: number;
    activeTenants: number;
    pausedTenants: number;
    pendingOnboarding: number;
    totalBandwidth30d: number;
    totalViews30d: number;
    viewsToday: number;
    viewsLast7Days: number;
  };
  topRestaurants: Array<{
    id: string;
    name: string;
    slug: string;
    total_bytes: number;
    total_views: number;
  }>;
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics/overview');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard - Super Admin</h1>
          <p className="text-muted-foreground mt-2">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard - Super Admin</h1>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const maxBandwidth = Math.max(
    ...(analytics?.topRestaurants.map(r => r.total_bytes) || [0])
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard - Super Admin</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tenants, usuarios y monitorea el uso del sistema
        </p>
      </div>

      {/* KPIs - Tenants */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Tenants</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Tenants</CardDescription>
              <CardTitle className="text-3xl">{analytics?.kpis.totalTenants || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Usuarios registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Activos</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {analytics?.kpis.activeTenants || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Con menú publicado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pausados</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">
                {analytics?.kpis.pausedTenants || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Temporalmente pausados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pendientes</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {analytics?.kpis.pendingOnboarding || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Sin completar onboarding</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* KPIs - Usage */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Uso y Tráfico</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Visitas Hoy</CardDescription>
              <CardTitle className="text-3xl">{analytics?.kpis.viewsToday || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Páginas vistas hoy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Últimos 7 Días</CardDescription>
              <CardTitle className="text-3xl">{analytics?.kpis.viewsLast7Days || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Páginas vistas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Últimos 30 Días</CardDescription>
              <CardTitle className="text-3xl">{analytics?.kpis.totalViews30d || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Total páginas vistas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Bandwidth (30d)</CardDescription>
              <CardTitle className="text-2xl">
                {(() => {
                  const bytes = analytics?.kpis.totalBandwidth30d || 0;
                  if (bytes === 0) return '0 B';
                  const k = 1024;
                  const sizes = ['B', 'KB', 'MB', 'GB'];
                  const i = Math.floor(Math.log(bytes) / Math.log(k));
                  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Transferencia total</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Restaurants by Bandwidth */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Top 5 Restaurantes por Bandwidth (30d)</h2>
        <Card>
          <CardContent className="pt-6">
            {analytics?.topRestaurants && analytics.topRestaurants.length > 0 ? (
              <div className="space-y-4">
                {analytics.topRestaurants.map((restaurant, index) => (
                  <div key={restaurant.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg text-muted-foreground">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{restaurant.name}</p>
                          <p className="text-xs text-muted-foreground">
                            /{restaurant.slug} • {restaurant.total_views} visitas
                          </p>
                        </div>
                      </div>
                    </div>
                    <BandwidthBar bytes={restaurant.total_bytes} maxBytes={maxBandwidth} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No hay datos disponibles</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Tenants</CardTitle>
              <CardDescription>Gestionar restaurantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/admin/tenants/new">Crear Nuevo Tenant</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/tenants">Ver Todos los Tenants</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usuarios</CardTitle>
              <CardDescription>Gestionar usuarios del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/users">Ver Usuarios</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sistema</CardTitle>
              <CardDescription>Configuración y logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground text-sm">
                Próximamente
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
