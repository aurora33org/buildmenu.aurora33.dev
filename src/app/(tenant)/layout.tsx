import Link from 'next/link';
import { Button } from '@/components/shared/ui/button';

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-xl font-bold">
              Menu Builder
            </Link>
            <nav className="flex gap-4">
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
                Dashboard
              </Link>
              <Link href="/menu" className="text-sm font-medium hover:text-primary">
                Editor
              </Link>
              <Link href="/settings" className="text-sm font-medium hover:text-primary">
                Configuración
              </Link>
            </nav>
          </div>
          <div>
            <form action="/api/auth/logout" method="POST">
              <Button type="submit" variant="ghost" size="sm">
                Cerrar Sesión
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
