import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getSessionFromCookie } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated and is super_admin
    const cookieHeader = request.headers.get('cookie');
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is super_admin
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { role: true }
    });

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get total tenants count
    const totalTenants = await prisma.user.count({
      where: {
        role: 'tenant_user',
        deletedAt: null
      }
    });

    // Get active tenants (those with restaurants that are active and not paused)
    const activeTenants = await prisma.user.count({
      where: {
        role: 'tenant_user',
        deletedAt: null,
        restaurant: {
          isActive: true,
          pausedAt: null
        }
      }
    });

    // Get paused tenants
    const pausedTenants = await prisma.user.count({
      where: {
        role: 'tenant_user',
        deletedAt: null,
        restaurant: {
          pausedAt: { not: null }
        }
      }
    });

    // Get pending onboarding (users without restaurant)
    const pendingOnboarding = await prisma.user.count({
      where: {
        role: 'tenant_user',
        deletedAt: null,
        restaurantId: null
      }
    });

    // Get total bandwidth usage (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const bandwidthStats = await prisma.usageMetric.aggregate({
      where: {
        date: { gte: thirtyDaysAgo }
      },
      _sum: {
        bandwidthBytes: true,
        pageViews: true
      }
    });

    // Get top 5 restaurants by bandwidth (last 30 days)
    const topByBandwidth = await prisma.restaurant.findMany({
      where: {
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        slug: true,
        usageMetrics: {
          where: {
            date: { gte: thirtyDaysAgo }
          },
          select: {
            bandwidthBytes: true,
            pageViews: true
          }
        }
      },
      take: 100
    });

    // Calculate totals and sort
    const topByBandwidthSorted = topByBandwidth
      .map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        total_bytes: restaurant.usageMetrics.reduce((sum, metric) => sum + Number(metric.bandwidthBytes), 0),
        total_views: restaurant.usageMetrics.reduce((sum, metric) => sum + metric.pageViews, 0)
      }))
      .sort((a, b) => b.total_bytes - a.total_bytes)
      .slice(0, 5);

    // Get total page views today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayViewsAggregate = await prisma.usageMetric.aggregate({
      where: {
        date: { gte: today }
      },
      _sum: {
        pageViews: true
      }
    });

    // Get total page views last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const last7DaysViewsAggregate = await prisma.usageMetric.aggregate({
      where: {
        date: { gte: sevenDaysAgo }
      },
      _sum: {
        pageViews: true
      }
    });

    return NextResponse.json({
      kpis: {
        totalTenants: totalTenants,
        activeTenants: activeTenants,
        pausedTenants: pausedTenants,
        pendingOnboarding: pendingOnboarding,
        totalBandwidth30d: Number(bandwidthStats._sum.bandwidthBytes ?? 0),
        totalViews30d: bandwidthStats._sum.pageViews ?? 0,
        viewsToday: todayViewsAggregate._sum.pageViews ?? 0,
        viewsLast7Days: last7DaysViewsAggregate._sum.pageViews ?? 0,
      },
      topRestaurants: topByBandwidthSorted,
    });

  } catch (error) {
    console.error('Analytics overview error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
