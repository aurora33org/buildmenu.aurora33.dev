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
    const { categoryIds } = body as { categoryIds: string[] };

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: 'categoryIds must be an array' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Update display_order for each category
    const updateOrder = db.transaction(() => {
      categoryIds.forEach((categoryId, index) => {
        db.prepare(`
          UPDATE categories
          SET display_order = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND restaurant_id = ?
        `).run(index, categoryId, session.restaurant_id);
      });
    });

    updateOrder();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Reorder categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
