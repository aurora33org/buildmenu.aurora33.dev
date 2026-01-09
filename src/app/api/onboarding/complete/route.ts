import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/schema';
import { getSessionFromCookie } from '@/lib/auth/session';
import { completeOnboardingSchema } from '@/lib/validations/onboarding.schema';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const cookieHeader = request.headers.get('cookie');
    const session = getSessionFromCookie(cookieHeader);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = completeOnboardingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const db = getDatabase();

    // Get user
    const user = db.prepare('SELECT id, email, name, restaurant_id FROM users WHERE id = ?').get(session.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has a restaurant (onboarding already completed)
    if ((user as any).restaurant_id) {
      return NextResponse.json(
        { error: 'Onboarding already completed' },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existingSlug = db.prepare('SELECT id FROM restaurants WHERE slug = ?').get(data.slug);
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Este slug ya está en uso. Por favor elige otro.' },
        { status: 409 }
      );
    }

    // Create restaurant ID
    const restaurantId = randomUUID();
    const settingsId = randomUUID();

    // Start transaction
    const createRestaurant = db.transaction(() => {
      // 1. Create restaurant
      db.prepare(`
        INSERT INTO restaurants (
          id, owner_id, name, slug, description,
          contact_email, contact_phone, address,
          facebook_url, instagram_handle, tiktok_handle,
          onboarding_completed, onboarding_completed_at,
          is_active, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(
        restaurantId,
        session.id,
        data.restaurantName,
        data.slug,
        data.description || null,
        data.contactEmail || null,
        data.contactPhone || null,
        data.address || null,
        data.facebookUrl || null,
        data.instagramHandle || null,
        data.tiktokHandle || null
      );

      // 2. Create restaurant settings
      db.prepare(`
        INSERT INTO restaurant_settings (
          id, restaurant_id, template_id, created_at, updated_at
        )
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(settingsId, restaurantId, data.templateId);

      // 3. Update user's restaurant_id and name
      db.prepare(`
        UPDATE users
        SET restaurant_id = ?, name = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(restaurantId, data.fullName, session.id);
    });

    // Execute transaction
    createRestaurant();

    // Fetch created restaurant
    const restaurant = db.prepare(`
      SELECT id, name, slug, onboarding_completed
      FROM restaurants
      WHERE id = ?
    `).get(restaurantId);

    console.log('[ONBOARDING COMPLETED]', {
      userId: session.id,
      restaurantId,
      slug: data.slug,
    });

    return NextResponse.json({
      success: true,
      restaurant,
      message: 'Onboarding completado exitosamente',
    }, { status: 201 });

  } catch (error) {
    console.error('Complete onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
