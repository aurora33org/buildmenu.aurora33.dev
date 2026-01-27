import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getSessionFromCookie } from '@/lib/auth/session';
import { updateCategorySchema } from '@/lib/validations/menu.schema';
import { sanitizeInput } from '@/lib/utils/sanitize';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const session = await getSessionFromCookie(cookieHeader);

    if (!session || session.role !== 'tenant_user' || !session.restaurantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const category = await prisma.category.findFirst({
      where: {
        id: params.id,
        restaurantId: session.restaurantId,
        deletedAt: null
      },
      include: {
        menuItems: {
          where: { deletedAt: null },
          select: { id: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      category: {
        ...category,
        items_count: category.menuItems.length
      }
    });

  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validation = updateCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verify category belongs to user's restaurant
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: params.id,
        restaurantId: session.restaurantId,
        deletedAt: null
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found or does not belong to your restaurant' },
        { status: 404 }
      );
    }

    // Sanitize text inputs
    const sanitizedData: any = {};
    if (data.name !== undefined) sanitizedData.name = sanitizeInput(data.name);
    if (data.description !== undefined) {
      sanitizedData.description = data.description ? sanitizeInput(data.description) : null;
    }
    if (data.icon !== undefined) sanitizedData.icon = data.icon;
    if (data.displayOrder !== undefined) sanitizedData.displayOrder = data.displayOrder;
    if (data.isVisible !== undefined) sanitizedData.isVisible = data.isVisible;

    const category = await prisma.category.update({
      where: { id: params.id },
      data: sanitizedData
    });

    console.log('[CATEGORY UPDATED]', { id: params.id, name: data.name });

    return NextResponse.json({
      success: true,
      category,
    });

  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const session = await getSessionFromCookie(cookieHeader);

    if (!session || session.role !== 'tenant_user' || !session.restaurantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify category belongs to user's restaurant
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: params.id,
        restaurantId: session.restaurantId,
        deletedAt: null
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found or does not belong to your restaurant' },
        { status: 404 }
      );
    }

    // Soft delete category and all its items
    await prisma.$transaction([
      prisma.category.update({
        where: { id: params.id },
        data: { deletedAt: new Date() }
      }),
      prisma.menuItem.updateMany({
        where: { categoryId: params.id },
        data: { deletedAt: new Date() }
      })
    ]);

    console.log('[CATEGORY DELETED]', { id: params.id });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
