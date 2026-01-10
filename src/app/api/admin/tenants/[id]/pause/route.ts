import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/schema';
import { getSessionFromCookie } from '@/lib/auth/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify user is authenticated and is super_admin
    const cookieHeader = request.headers.get('cookie');
    const session = getSessionFromCookie(cookieHeader);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getDatabase();

    // Verify user is super_admin
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(session.id) as { role: string } | undefined;

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get user to find restaurant_id
    const tenant = db.prepare(`
      SELECT id, restaurant_id FROM users WHERE id = ? AND role = 'tenant_user' AND deleted_at IS NULL
    `).get(id) as { id: string; restaurant_id: string | null } | undefined;

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    if (!tenant.restaurant_id) {
      return NextResponse.json(
        { error: 'Tenant has not completed onboarding' },
        { status: 400 }
      );
    }

    // Get optional reason from request body
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || 'Paused by admin';

    // Pause the restaurant
    db.prepare(`
      UPDATE restaurants
      SET paused_at = CURRENT_TIMESTAMP,
          paused_reason = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(reason, tenant.restaurant_id);

    console.log('[TENANT PAUSED]', {
      tenantId: id,
      restaurantId: tenant.restaurant_id,
      reason,
    });

    return NextResponse.json({
      success: true,
      message: 'Tenant paused successfully',
    });

  } catch (error) {
    console.error('Pause tenant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
