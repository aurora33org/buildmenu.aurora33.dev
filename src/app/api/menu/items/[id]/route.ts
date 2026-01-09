import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/schema';
import { getSessionFromCookie } from '@/lib/auth/session';
import { updateMenuItemSchema } from '@/lib/validations/menu.schema';

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

    const { id: itemId } = await params;
    const db = getDatabase();

    // Verify item belongs to user's restaurant
    const existingItem = db.prepare(`
      SELECT id FROM menu_items
      WHERE id = ? AND restaurant_id = ? AND deleted_at IS NULL
    `).get(itemId, session.restaurant_id);

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
    if (data.basePrice !== undefined) {
      updates.push('base_price = ?');
      values.push(data.basePrice ?? null);
    }
    if (data.displayOrder !== undefined) {
      updates.push('display_order = ?');
      values.push(data.displayOrder);
    }
    if (data.isVisible !== undefined) {
      updates.push('is_visible = ?');
      values.push(data.isVisible ? 1 : 0);
    }
    if (data.isFeatured !== undefined) {
      updates.push('is_featured = ?');
      values.push(data.isFeatured ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(itemId);

    db.prepare(`
      UPDATE menu_items
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...values);

    const item = db.prepare(`
      SELECT mi.*, c.name as category_name
      FROM menu_items mi
      INNER JOIN categories c ON c.id = mi.category_id
      WHERE mi.id = ?
    `).get(itemId);

    return NextResponse.json({
      success: true,
      item,
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
    const session = getSessionFromCookie(cookieHeader);

    if (!session || session.role !== 'tenant_user' || !session.restaurant_id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: itemId } = await params;
    const db = getDatabase();

    // Verify item belongs to user's restaurant
    const existingItem = db.prepare(`
      SELECT id FROM menu_items
      WHERE id = ? AND restaurant_id = ? AND deleted_at IS NULL
    `).get(itemId, session.restaurant_id);

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Soft delete
    db.prepare(`
      UPDATE menu_items
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(itemId);

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
