import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/schema';
import { getSessionFromCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const session = getSessionFromCookie(cookieHeader);

    if (!session || !session.restaurant_id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { itemIds, categoryId } = body as { itemIds: string[]; categoryId: string };

    if (!Array.isArray(itemIds)) {
      return NextResponse.json(
        { error: 'itemIds must be an array' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Update display_order for each item within the category
    const updateOrder = db.transaction(() => {
      itemIds.forEach((itemId, index) => {
        db.prepare(`
          UPDATE menu_items
          SET display_order = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND category_id = ? AND restaurant_id = ?
        `).run(index, itemId, categoryId, session.restaurant_id);
      });
    });

    updateOrder();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Reorder items error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
