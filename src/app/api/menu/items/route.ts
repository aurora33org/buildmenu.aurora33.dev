import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getSessionFromCookie } from '@/lib/auth/session';
import { createMenuItemSchema } from '@/lib/validations/menu.schema';
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

    const items = await prisma.menuItem.findMany({
      where: {
        restaurantId: session.restaurantId,
        deletedAt: null
      },
      include: {
        category: {
          select: {
            name: true,
            displayOrder: true
          }
        }
      },
      orderBy: [
        { category: { displayOrder: 'asc' } },
        { displayOrder: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    const itemsWithCategoryName = items.map(item => ({
      ...item,
      category_name: item.category.name,
      base_price: item.basePrice,
      display_order: item.displayOrder,
      is_visible: item.isVisible,
      is_featured: item.isFeatured,
      image_url: item.imageUrl,
      created_at: item.createdAt,
      updated_at: item.updatedAt
    }));

    return NextResponse.json({ items: itemsWithCategoryName });

  } catch (error) {
    console.error('List items error:', error);
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
    const validation = createMenuItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verify category belongs to user's restaurant
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        restaurantId: session.restaurantId,
        deletedAt: null
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found or does not belong to your restaurant' },
        { status: 404 }
      );
    }

    // Sanitize text inputs
    const sanitizedName = sanitizeInput(data.name);
    const sanitizedDescription = data.description ? sanitizeInput(data.description) : null;

    const item = await prisma.menuItem.create({
      data: {
        categoryId: data.categoryId,
        restaurantId: session.restaurantId,
        name: sanitizedName,
        description: sanitizedDescription,
        basePrice: data.basePrice ?? null,
        displayOrder: data.displayOrder,
        isVisible: data.isVisible,
        isFeatured: data.isFeatured
      },
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    });

    console.log('[ITEM CREATED]', { name: data.name, category_id: data.categoryId });

    return NextResponse.json({
      success: true,
      item: {
        ...item,
        category_name: item.category.name
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Create item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
