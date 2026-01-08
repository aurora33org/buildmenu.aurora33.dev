import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard - Super Admin</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tenants, usuarios y configuraciones del sistema
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tenants</CardTitle>
            <CardDescription>Gestionar restaurantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/admin/tenants/new">Crear Nuevo Tenant</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/tenants">Ver Todos los Tenants</Link>
              </Button>
            </div>
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
            <CardTitle>Estadísticas</CardTitle>
            <CardDescription>Métricas del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
              Próximamente
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
