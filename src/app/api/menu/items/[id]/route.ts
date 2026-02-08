import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getSessionFromCookie } from '@/lib/auth/session';
import { updateMenuItemSchema } from '@/lib/validations/menu.schema';
import { sanitizeInput } from '@/lib/utils/sanitize';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieHeader = request.headers.get('cookie');
    const session = await getSessionFromCookie(cookieHeader);

    if (!session || session.role !== 'tenant_user' || !session.restaurantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const item = await prisma.menuItem.findFirst({
      where: {
        id: id,
        restaurantId: session.restaurantId,
        deletedAt: null
      },
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      item: {
        ...item,
        category_name: item.category.name
      }
    });

  } catch (error) {
    console.error('Get item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieHeader = request.headers.get('cookie');
    const session = await getSessionFromCookie(cookieHeader);

    if (!session || session.role !== 'tenant_user' || !session.restaurantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    // Verify item belongs to user's restaurant
    const existingItem = await prisma.menuItem.findFirst({
      where: {
        id: id,
        restaurantId: session.restaurantId,
        deletedAt: null
      }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found or does not belong to your restaurant' },
        { status: 404 }
      );
    }

    // Sanitize text inputs
    const sanitizedData: any = {};
    if (data.name !== undefined) sanitizedData.name = sanitizeInput(data.name);
    if (data.description !== undefined) {
      sanitizedData.description = data.description ? sanitizeInput(data.description) : null;
    }
    if (data.basePrice !== undefined) sanitizedData.basePrice = data.basePrice;
    if (data.displayOrder !== undefined) sanitizedData.displayOrder = data.displayOrder;
    if (data.isVisible !== undefined) sanitizedData.isVisible = data.isVisible;
    if (data.isFeatured !== undefined) sanitizedData.isFeatured = data.isFeatured;

    const item = await prisma.menuItem.update({
      where: { id: id },
      data: sanitizedData,
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    });

    console.log('[ITEM UPDATED]', { id: id, name: data.name });

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
    const { id } = await params;
    const cookieHeader = request.headers.get('cookie');
    const session = await getSessionFromCookie(cookieHeader);

    if (!session || session.role !== 'tenant_user' || !session.restaurantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify item belongs to user's restaurant
    const existingItem = await prisma.menuItem.findFirst({
      where: {
        id: id,
        restaurantId: session.restaurantId,
        deletedAt: null
      }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found or does not belong to your restaurant' },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.menuItem.update({
      where: { id: id },
      data: { deletedAt: new Date() }
    });

    console.log('[ITEM DELETED]', { id: id });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
