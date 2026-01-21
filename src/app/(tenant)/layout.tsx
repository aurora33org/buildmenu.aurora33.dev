import Link from 'next/link';
import { cookies } from 'next/headers';
import { Button } from '@/components/shared/ui/button';
import { getSessionFromCookie } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';
import { PausedBanner } from '@/components/tenant/PausedBanner';

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get session and check pause status
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const session = await getSessionFromCookie(cookieHeader);

  let pauseInfo = null;

  if (session && session.restaurantId) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: session.restaurantId },
      select: {
        pausedAt: true,
        pausedReason: true,
      },
    });

    if (restaurant && restaurant.pausedAt !== null) {
      pauseInfo = {
        pausedAt: restaurant.pausedAt,
        pausedReason: restaurant.pausedReason || 'No se especificó motivo',
      };
    }
  }

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
      {pauseInfo && <PausedBanner reason={pauseInfo.pausedReason} />}
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
