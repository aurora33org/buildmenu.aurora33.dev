import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/schema';
import { getSessionFromCookie } from '@/lib/auth/session';
import { createMenuItemSchema } from '@/lib/validations/menu.schema';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const session = getSessionFromCookie(cookieHeader);

    if (!session || session.role !== 'tenant_user' || !session.restaurant_id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getDatabase();

    const items = db.prepare(`
      SELECT
        mi.*,
        c.name as category_name
      FROM menu_items mi
      INNER JOIN categories c ON c.id = mi.category_id
      WHERE mi.restaurant_id = ?
        AND mi.deleted_at IS NULL
      ORDER BY c.display_order ASC, mi.display_order ASC, mi.created_at ASC
    `).all(session.restaurant_id);

    return NextResponse.json({ items });

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
    const session = getSessionFromCookie(cookieHeader);

    if (!session || session.role !== 'tenant_user' || !session.restaurant_id) {
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
    const db = getDatabase();

    // Verify category belongs to user's restaurant
    const category = db.prepare(`
      SELECT id FROM categories
      WHERE id = ? AND restaurant_id = ? AND deleted_at IS NULL
    `).get(data.categoryId, session.restaurant_id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found or does not belong to your restaurant' },
        { status: 404 }
      );
    }

    const itemId = randomUUID();

    db.prepare(`
      INSERT INTO menu_items (
        id, category_id, restaurant_id, name, description,
        base_price, display_order, is_visible, is_featured
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      itemId,
      data.categoryId,
      session.restaurant_id,
      data.name,
      data.description || null,
      data.basePrice ?? null,
      data.displayOrder,
      data.isVisible ? 1 : 0,
      data.isFeatured ? 1 : 0
    );

    const item = db.prepare(`
      SELECT mi.*, c.name as category_name
      FROM menu_items mi
      INNER JOIN categories c ON c.id = mi.category_id
      WHERE mi.id = ?
    `).get(itemId);

    console.log('[ITEM CREATED]', { name: data.name, category_id: data.categoryId });

    return NextResponse.json({
      success: true,
      item,
    }, { status: 201 });

  } catch (error) {
    console.error('Create item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
