import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getSessionFromCookie } from '@/lib/auth/session';
import { updateMenuItemSchema } from '@/lib/validations/menu.schema';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: itemId } = await params;

    // Verify item belongs to user's restaurant
    const existingItem = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        restaurantId: session.restaurantId,
        deletedAt: null
      }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = updateMenuItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.basePrice !== undefined) updateData.basePrice = data.basePrice ?? null;
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
    if (data.isVisible !== undefined) updateData.isVisible = data.isVisible;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const item = await prisma.menuItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      item: {
        ...item,
        category_name: item.category.name
      },
    });

  } catch (error) {
    console.error('Update item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: itemId } = await params;

    // Verify item belongs to user's restaurant
    const existingItem = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        restaurantId: session.restaurantId,
        deletedAt: null
      }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.menuItem.update({
      where: { id: itemId },
      data: { deletedAt: new Date() }
    });

    console.log('[ITEM DELETED]', { id: itemId });

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully',
    });

  } catch (error) {
    console.error('Delete item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
