import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import Link from 'next/link';

export default function TenantDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Menú</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tu menú digital para tu restaurante
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Editor de Menú</CardTitle>
            <CardDescription>Edita categorías y platillos</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/menu">Editar Menú</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personalización</CardTitle>
            <CardDescription>Colores, fuentes y template</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/settings">Configurar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Menú Público</CardTitle>
            <CardDescription>Vista de clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/preview">Ver Preview</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>URL Pública & QR</CardTitle>
          <CardDescription>Comparte tu menú con tus clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Funcionalidad disponible próximamente
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
