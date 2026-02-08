import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getSessionFromCookie } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';
import { createTenantSimpleSchema } from '@/lib/validations/tenant.schema';

export async function POST(request: NextRequest) {
  try {
    // Verify user is super_admin
    const cookieHeader = request.headers.get('cookie');
    const session = await getSessionFromCookie(cookieHeader);

    if (!session || session.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input (SIMPLIFIED - only user data)
    const validation = createTenantSimpleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if email is unique
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true }
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user WITHOUT restaurant_id (will be set during onboarding)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: passwordHash,
        name: data.name,
        role: 'tenant_user',
        restaurantId: null
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    console.log('[USER CREATED]', { email: data.email, requiresOnboarding: true });

    return NextResponse.json({
      success: true,
      user,
      message: 'Usuario creado exitosamente. Debe completar el onboarding en su primer login.',
      loginUrl: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/login` : '/login',
    }, { status: 201 });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify user is super_admin
    const cookieHeader = request.headers.get('cookie');
    const session = await getSessionFromCookie(cookieHeader);

    if (!session || session.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }

    // Get all tenant users (with or without restaurant) with analytics
    const users = await prisma.user.findMany({
      where: {
        role: 'tenant_user',
        deletedAt: null
      },
      include: {
        restaurant: {
          include: {
            settings: {
              select: {
                templateId: true
              }
            },
            categories: {
              where: { deletedAt: null },
              select: { id: true }
            },
            menuItems: {
              where: { deletedAt: null },
              select: { id: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate metrics for each user
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const tenants = await Promise.all(users.map(async (user) => {
      let totalViews = 0;
      let viewsLast7Days = 0;
      let bandwidth30d = 0;

      if (user.restaurant) {
        // Get total views
        const totalViewsResult = await prisma.usageMetric.aggregate({
          where: { restaurantId: user.restaurant.id },
          _sum: { pageViews: true }
        });
        totalViews = totalViewsResult._sum.pageViews ?? 0;

        // Get views last 7 days
        const views7DaysResult = await prisma.usageMetric.aggregate({
          where: {
            restaurantId: user.restaurant.id,
            date: { gte: sevenDaysAgo }
          },
          _sum: { pageViews: true }
        });
        viewsLast7Days = views7DaysResult._sum.pageViews ?? 0;

        // Get bandwidth last 30 days
        const bandwidth30dResult = await prisma.usageMetric.aggregate({
          where: {
            restaurantId: user.restaurant.id,
            date: { gte: thirtyDaysAgo }
          },
          _sum: { bandwidthBytes: true }
        });
        bandwidth30d = Number(bandwidth30dResult._sum.bandwidthBytes ?? 0);
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        restaurant_id: user.restaurantId,
        created_at: user.createdAt,
        restaurant_name: user.restaurant?.name ?? null,
        slug: user.restaurant?.slug ?? null,
        is_active: user.restaurant?.isActive ?? null,
        onboarding_completed: user.restaurant?.onboardingCompleted ?? null,
        paused_at: user.restaurant?.pausedAt ?? null,
        paused_reason: user.restaurant?.pausedReason ?? null,
        template_id: user.restaurant?.settings?.templateId ?? null,
        categories_count: user.restaurant?.categories.length ?? 0,
        items_count: user.restaurant?.menuItems.length ?? 0,
        total_views: totalViews,
        views_last_7_days: viewsLast7Days,
        bandwidth_30d: bandwidth30d
      };
    }));

    return NextResponse.json({ tenants });

  } catch (error) {
    console.error('List tenants error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
