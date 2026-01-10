import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/schema';
import { getSessionFromCookie } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const session = getSessionFromCookie(cookieHeader);

    if (!session || !session.restaurant_id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getDatabase();

    const settings = db.prepare(`
      SELECT * FROM restaurant_settings WHERE restaurant_id = ?
    `).get(session.restaurant_id);

    return NextResponse.json({ settings });

  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const {
      template_id,
      primary_color,
      secondary_color,
      accent_color,
      background_color,
      text_color,
      font_heading,
      font_body,
    } = body;

    const db = getDatabase();

    db.prepare(`
      UPDATE restaurant_settings
      SET
        template_id = COALESCE(?, template_id),
        primary_color = ?,
        secondary_color = ?,
        accent_color = ?,
        background_color = ?,
        text_color = ?,
        font_heading = ?,
        font_body = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE restaurant_id = ?
    `).run(
      template_id,
      primary_color,
      secondary_color,
      accent_color,
      background_color,
      text_color,
      font_heading,
      font_body,
      session.restaurant_id
    );

    const settings = db.prepare(`
      SELECT * FROM restaurant_settings WHERE restaurant_id = ?
    `).get(session.restaurant_id);

    return NextResponse.json({
      success: true,
      settings,
    });

  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
