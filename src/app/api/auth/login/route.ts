import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('[LOGIN] Attempting login for:', email);

    if (!email || !password) {
      console.log('[LOGIN] Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email,
        deletedAt: null,
      },
    });

    console.log('[LOGIN] User found:', user ? 'YES' : 'NO');

    if (!user) {
      console.log('[LOGIN] User not found in database');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    console.log('[LOGIN] Verifying password...');
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    console.log('[LOGIN] Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('[LOGIN] Invalid password');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('[LOGIN] Login successful for:', email);

    // Create session
    const { token } = await createSession(user.id);

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        restaurant_id: user.restaurantId,
      },
    });

    // Set HTTP-only cookie
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: parseInt(process.env.SESSION_MAX_AGE || '604800'), // 7 days in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
