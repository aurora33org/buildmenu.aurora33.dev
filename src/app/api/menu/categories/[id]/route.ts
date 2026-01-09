import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/schema';
import { getSessionFromCookie } from '@/lib/auth/session';
import { updateCategorySchema } from '@/lib/validations/menu.schema';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const session = getSessionFromCookie(cookieHeader);

    if (!session || session.role !== 'tenant_user' || !session.restaurant_id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: categoryId } = await params;
    const db = getDatabase();

    // Verify category belongs to user's restaurant
    const existingCategory = db.prepare(`
      SELECT id FROM categories
      WHERE id = ? AND restaurant_id = ? AND deleted_at IS NULL
    `).get(categoryId, session.restaurant_id);

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
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description || null);
    }
    if (data.displayOrder !== undefined) {
      updates.push('display_order = ?');
      values.push(data.displayOrder);
    }
    if (data.isVisible !== undefined) {
      updates.push('is_visible = ?');
      values.push(data.isVisible ? 1 : 0);
    }
    if (data.icon !== undefined) {
      updates.push('icon = ?');
      values.push(data.icon || null);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(categoryId);

    db.prepare(`
      UPDATE categories
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...values);

    const category = db.prepare(`
      SELECT * FROM categories WHERE id = ?
    `).get(categoryId);

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
    const session = getSessionFromCookie(cookieHeader);

    if (!session || session.role !== 'tenant_user' || !session.restaurant_id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: categoryId } = await params;
    const db = getDatabase();

    // Verify category belongs to user's restaurant
    const existingCategory = db.prepare(`
      SELECT id FROM categories
      WHERE id = ? AND restaurant_id = ? AND deleted_at IS NULL
    `).get(categoryId, session.restaurant_id);

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Soft delete (also soft deletes all items in this category)
    db.prepare(`
      UPDATE categories
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(categoryId);

    db.prepare(`
      UPDATE menu_items
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE category_id = ?
    `).run(categoryId);

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
