import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getSessionFromCookie } from '@/lib/auth/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Get user to find restaurant_id
    const tenant = await prisma.user.findFirst({
      where: {
        id: id,
        role: 'tenant_user',
        deletedAt: null
      },
      select: {
        id: true,
        restaurantId: true
      }
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    if (!tenant.restaurantId) {
      return NextResponse.json(
        { error: 'Tenant has not completed onboarding' },
        { status: 400 }
      );
    }

    // Unpause the restaurant
    await prisma.restaurant.update({
      where: { id: tenant.restaurantId },
      data: {
        pausedAt: null,
        pausedReason: null
      }
    });

    console.log('[TENANT UNPAUSED]', {
      tenantId: id,
      restaurantId: tenant.restaurantId,
    });

    return NextResponse.json({
      success: true,
      message: 'Tenant unpaused successfully',
    });

  } catch (error) {
    console.error('Unpause tenant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
