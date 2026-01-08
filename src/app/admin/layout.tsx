import Link from 'next/link';
import { Button } from '@/components/shared/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="text-xl font-bold">
              Menu Builder <span className="text-sm font-normal text-muted-foreground">Admin</span>
            </Link>
            <nav className="flex gap-4">
              <Link href="/admin/dashboard" className="text-sm font-medium hover:text-primary">
                Dashboard
              </Link>
              <Link href="/admin/tenants" className="text-sm font-medium hover:text-primary">
                Tenants
              </Link>
              <Link href="/admin/users" className="text-sm font-medium hover:text-primary">
                Usuarios
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
