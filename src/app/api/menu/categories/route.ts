import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/schema';
import { getSessionFromCookie } from '@/lib/auth/session';
import { createCategorySchema } from '@/lib/validations/menu.schema';
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

    const categories = db.prepare(`
      SELECT
        id,
        name,
        description,
        display_order,
        is_visible,
        icon,
        created_at,
        (SELECT COUNT(*) FROM menu_items WHERE category_id = categories.id AND deleted_at IS NULL) as items_count
      FROM categories
      WHERE restaurant_id = ?
        AND deleted_at IS NULL
      ORDER BY display_order ASC, created_at ASC
    `).all(session.restaurant_id);

    return NextResponse.json({ categories });

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
    const session = getSessionFromCookie(cookieHeader);

    if (!session || session.role !== 'tenant_user' || !session.restaurant_id) {
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
    const db = getDatabase();
    const categoryId = randomUUID();

    db.prepare(`
      INSERT INTO categories (id, restaurant_id, name, description, display_order, is_visible, icon)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      categoryId,
      session.restaurant_id,
      data.name,
      data.description || null,
      data.displayOrder,
      data.isVisible ? 1 : 0,
      data.icon || null
    );

    const category = db.prepare(`
      SELECT * FROM categories WHERE id = ?
    `).get(categoryId);

    console.log('[CATEGORY CREATED]', { name: data.name, restaurant_id: session.restaurant_id });

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
