import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getSessionFromCookie } from '@/lib/auth/session';
import { createCategorySchema } from '@/lib/validations/menu.schema';
import { sanitizeInput } from '@/lib/utils/sanitize';

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const session = await getSessionFromCookie(cookieHeader);

    if (!session || session.role !== 'tenant_user' || !session.restaurantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const categories = await prisma.category.findMany({
      where: {
        restaurantId: session.restaurantId,
        deletedAt: null
      },
      include: {
        menuItems: {
          where: { deletedAt: null },
          select: { id: true }
        }
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    const categoriesWithCount = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      display_order: cat.displayOrder,
      is_visible: cat.isVisible,
      icon: cat.icon,
      created_at: cat.createdAt,
      items_count: cat.menuItems.length
    }));

    return NextResponse.json({ categories: categoriesWithCount });

  } catch (error) {
    console.error('List categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const session = await getSessionFromCookie(cookieHeader);

    if (!session || session.role !== 'tenant_user' || !session.restaurantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Sanitize text inputs
    const sanitizedName = sanitizeInput(data.name);
    const sanitizedDescription = data.description ? sanitizeInput(data.description) : null;

    const category = await prisma.category.create({
      data: {
        restaurantId: session.restaurantId,
        name: sanitizedName,
        description: sanitizedDescription,
        displayOrder: data.displayOrder,
        isVisible: data.isVisible,
        icon: data.icon || null
      }
    });

    console.log('[CATEGORY CREATED]', { name: data.name, restaurant_id: session.restaurantId });

    return NextResponse.json({
      success: true,
      category,
    }, { status: 201 });

  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
