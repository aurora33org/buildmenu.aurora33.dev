import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/schema';
import { getSessionFromCookie } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated and is super_admin
    const cookieHeader = request.headers.get('cookie');
    const session = getSessionFromCookie(cookieHeader);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getDatabase();

    // Verify user is super_admin
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(session.id) as { role: string } | undefined;

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get total tenants count
    const totalTenants = db.prepare(`
      SELECT COUNT(*) as count
      FROM users
      WHERE role = 'tenant_user' AND deleted_at IS NULL
    `).get() as { count: number };

    // Get active tenants (those with restaurants that are active and not paused)
    const activeTenants = db.prepare(`
      SELECT COUNT(*) as count
      FROM users u
      INNER JOIN restaurants r ON r.id = u.restaurant_id
      WHERE u.role = 'tenant_user'
        AND u.deleted_at IS NULL
        AND r.is_active = 1
        AND r.paused_at IS NULL
    `).get() as { count: number };

    // Get paused tenants
    const pausedTenants = db.prepare(`
      SELECT COUNT(*) as count
      FROM users u
      INNER JOIN restaurants r ON r.id = u.restaurant_id
      WHERE u.role = 'tenant_user'
        AND u.deleted_at IS NULL
        AND r.paused_at IS NOT NULL
    `).get() as { count: number };

    // Get pending onboarding (users without restaurant)
    const pendingOnboarding = db.prepare(`
      SELECT COUNT(*) as count
      FROM users
      WHERE role = 'tenant_user'
        AND deleted_at IS NULL
        AND restaurant_id IS NULL
    `).get() as { count: number };

    // Get total bandwidth usage (last 30 days)
    const bandwidthStats = db.prepare(`
      SELECT
        COALESCE(SUM(bandwidth_bytes), 0) as total_bytes,
        COALESCE(SUM(page_views), 0) as total_views
      FROM usage_metrics
      WHERE date >= date('now', '-30 days')
    `).get() as { total_bytes: number; total_views: number };

    // Get top 5 restaurants by bandwidth (last 30 days)
    const topByBandwidth = db.prepare(`
      SELECT
        r.id,
        r.name,
        r.slug,
        COALESCE(SUM(um.bandwidth_bytes), 0) as total_bytes,
        COALESCE(SUM(um.page_views), 0) as total_views
      FROM restaurants r
      LEFT JOIN usage_metrics um ON um.restaurant_id = r.id AND um.date >= date('now', '-30 days')
      WHERE r.deleted_at IS NULL
      GROUP BY r.id, r.name, r.slug
      ORDER BY total_bytes DESC
      LIMIT 5
    `).all();

    // Get total page views today
    const todayViews = db.prepare(`
      SELECT COALESCE(SUM(page_views), 0) as count
      FROM usage_metrics
      WHERE date = date('now')
    `).get() as { count: number };

    // Get total page views last 7 days
    const last7DaysViews = db.prepare(`
      SELECT COALESCE(SUM(page_views), 0) as count
      FROM usage_metrics
      WHERE date >= date('now', '-7 days')
    `).get() as { count: number };

    return NextResponse.json({
      kpis: {
        totalTenants: totalTenants.count,
        activeTenants: activeTenants.count,
        pausedTenants: pausedTenants.count,
        pendingOnboarding: pendingOnboarding.count,
        totalBandwidth30d: bandwidthStats.total_bytes,
        totalViews30d: bandwidthStats.total_views,
        viewsToday: todayViews.count,
        viewsLast7Days: last7DaysViews.count,
      },
      topRestaurants: topByBandwidth,
    });

  } catch (error) {
    console.error('Analytics overview error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
