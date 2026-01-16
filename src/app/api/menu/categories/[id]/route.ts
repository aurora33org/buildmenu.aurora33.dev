import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getSessionFromCookie } from '@/lib/auth/session';
import { updateCategorySchema } from '@/lib/validations/menu.schema';

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

    const { id: categoryId } = await params;

    // Verify category belongs to user's restaurant
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        restaurantId: session.restaurantId,
        deletedAt: null
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
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
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
    if (data.isVisible !== undefined) updateData.isVisible = data.isVisible;
    if (data.icon !== undefined) updateData.icon = data.icon || null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: updateData
    });

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

    const { id: categoryId } = await params;

    // Verify category belongs to user's restaurant
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        restaurantId: session.restaurantId,
        deletedAt: null
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Soft delete (also soft deletes all items in this category)
    await prisma.$transaction([
      prisma.category.update({
        where: { id: categoryId },
        data: { deletedAt: new Date() }
      }),
      prisma.menuItem.updateMany({
        where: { categoryId: categoryId },
        data: { deletedAt: new Date() }
      })
    ]);

    console.log('[CATEGORY DELETED]', { id: categoryId });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });

  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
