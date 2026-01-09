import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/schema';
import { getSessionFromCookie } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';
import { createTenantSchema } from '@/lib/validations/tenant.schema';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Verify user is super_admin
    const cookieHeader = request.headers.get('cookie');
    const session = getSessionFromCookie(cookieHeader);

    if (!session || session.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = createTenantSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const db = getDatabase();

    // Check if slug is unique
    const existingSlug = db.prepare('SELECT id FROM restaurants WHERE slug = ?').get(data.slug);
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Este slug ya está en uso' },
        { status: 409 }
      );
    }

    // Check if email is unique
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(data.userEmail);
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create IDs
    const restaurantId = randomUUID();
    const userId = randomUUID();
    const settingsId = randomUUID();

    // Use SQLite transaction with deferred foreign key checks
    const createTenant = db.transaction(() => {
      // 1. Create user FIRST (without restaurant_id to avoid FK constraint)
      db.prepare(`
        INSERT INTO users (id, email, password_hash, name, role, restaurant_id)
        VALUES (?, ?, ?, ?, ?, NULL)
      `).run(
        userId,
        data.userEmail,
        passwordHash,
        data.userName,
        'tenant_user'
      );

      // 2. Create restaurant (now user exists for owner_id)
      db.prepare(`
        INSERT INTO restaurants (id, owner_id, name, slug, description, contact_email, contact_phone, address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        restaurantId,
        userId,
        data.restaurantName,
        data.slug,
        data.description || null,
        data.contactEmail || null,
        data.contactPhone || null,
        data.address || null
      );

      // 3. Update user with restaurant_id
      db.prepare(`
        UPDATE users SET restaurant_id = ? WHERE id = ?
      `).run(restaurantId, userId);

      // 4. Create restaurant settings
      db.prepare(`
        INSERT INTO restaurant_settings (id, restaurant_id, template_id)
        VALUES (?, ?, ?)
      `).run(
        settingsId,
        restaurantId,
        data.templateId
      );
    });

    // Execute transaction
    try {
      createTenant();

      // Fetch created tenant
      const tenant = db.prepare(`
        SELECT
          r.id,
          r.name,
          r.slug,
          r.description,
          r.contact_email,
          r.contact_phone,
          r.address,
          r.created_at,
          u.id as user_id,
          u.email as user_email,
          u.name as user_name,
          rs.template_id
        FROM restaurants r
        INNER JOIN users u ON u.id = r.owner_id
        INNER JOIN restaurant_settings rs ON rs.restaurant_id = r.id
        WHERE r.id = ?
      `).get(restaurantId);

      console.log('[TENANT CREATED]', { slug: data.slug, userEmail: data.userEmail });

      return NextResponse.json({
        success: true,
        tenant,
      }, { status: 201 });

    } catch (error) {
      console.error('[TENANT CREATION ERROR]', error);
      throw error;
    }

  } catch (error) {
    console.error('Create tenant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify user is super_admin
    const cookieHeader = request.headers.get('cookie');
    const session = getSessionFromCookie(cookieHeader);

    if (!session || session.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }

    const db = getDatabase();

    const tenants = db.prepare(`
      SELECT
        r.id,
        r.name,
        r.slug,
        r.is_active,
        r.created_at,
        u.email as user_email,
        u.name as user_name,
        rs.template_id,
        (SELECT COUNT(*) FROM categories WHERE restaurant_id = r.id AND deleted_at IS NULL) as categories_count,
        (SELECT COUNT(*) FROM menu_items WHERE restaurant_id = r.id AND deleted_at IS NULL) as items_count
      FROM restaurants r
      INNER JOIN users u ON u.id = r.owner_id
      INNER JOIN restaurant_settings rs ON rs.restaurant_id = r.id
      WHERE r.deleted_at IS NULL
      ORDER BY r.created_at DESC
    `).all();

    return NextResponse.json({ tenants });

  } catch (error) {
    console.error('List tenants error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
