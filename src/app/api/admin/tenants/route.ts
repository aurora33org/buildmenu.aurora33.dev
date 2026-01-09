import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/schema';
import { getSessionFromCookie } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';
import { createTenantSimpleSchema } from '@/lib/validations/tenant.schema';
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

    // Validate input (SIMPLIFIED - only user data)
    const validation = createTenantSimpleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const db = getDatabase();

    // Check if email is unique
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email);
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user ID
    const userId = randomUUID();

    // Create user WITHOUT restaurant_id (will be set during onboarding)
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, restaurant_id)
      VALUES (?, ?, ?, ?, 'tenant_user', NULL)
    `).run(
      userId,
      data.email,
      passwordHash,
      data.name
    );

    // Fetch created user
    const user = db.prepare(`
      SELECT id, email, name, role, created_at
      FROM users
      WHERE id = ?
    `).get(userId);

    console.log('[USER CREATED]', { email: data.email, requiresOnboarding: true });

    return NextResponse.json({
      success: true,
      user,
      message: 'Usuario creado exitosamente. Debe completar el onboarding en su primer login.',
      loginUrl: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/login` : '/login',
    }, { status: 201 });

  } catch (error) {
    console.error('Create user error:', error);
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

    // Get all tenant users (with or without restaurant)
    const tenants = db.prepare(`
      SELECT
        u.id,
        u.email,
        u.name,
        u.restaurant_id,
        u.created_at,
        r.id as restaurant_id,
        r.name as restaurant_name,
        r.slug,
        r.is_active,
        r.onboarding_completed,
        r.paused_at,
        rs.template_id,
        (SELECT COUNT(*) FROM categories WHERE restaurant_id = r.id AND deleted_at IS NULL) as categories_count,
        (SELECT COUNT(*) FROM menu_items WHERE restaurant_id = r.id AND deleted_at IS NULL) as items_count
      FROM users u
      LEFT JOIN restaurants r ON r.id = u.restaurant_id
      LEFT JOIN restaurant_settings rs ON rs.restaurant_id = r.id
      WHERE u.role = 'tenant_user' AND u.deleted_at IS NULL
      ORDER BY u.created_at DESC
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
