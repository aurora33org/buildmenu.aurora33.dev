import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getSessionFromCookie } from '@/lib/auth/session';
import { updateRestaurantInfoSchema } from '@/lib/validations/restaurant.schema';
import { sanitizeInput } from '@/lib/utils/sanitize';

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const session = await getSessionFromCookie(cookieHeader);

    if (!session || !session.restaurantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: session.restaurantId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        contactEmail: true,
        contactPhone: true,
        address: true,
        facebookUrl: true,
        instagramHandle: true,
        tiktokHandle: true,
        isActive: true
      }
    });

    return NextResponse.json({ restaurant });

  } catch (error) {
    console.error('Get restaurant info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const session = await getSessionFromCookie(cookieHeader);

    if (!session || !session.restaurantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = updateRestaurantInfoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Build update object with only provided fields, sanitize text inputs
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = sanitizeInput(data.name);
    if (data.description !== undefined) {
      updateData.description = data.description ? sanitizeInput(data.description) : null;
    }
    if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail; // Don't sanitize email (already validated)
    if (data.contactPhone !== undefined) {
      updateData.contactPhone = data.contactPhone ? sanitizeInput(data.contactPhone) : null;
    }
    if (data.address !== undefined) {
      updateData.address = data.address ? sanitizeInput(data.address) : null;
    }
    if (data.facebookUrl !== undefined) {
      updateData.facebookUrl = data.facebookUrl ? sanitizeInput(data.facebookUrl) : null;
    }
    if (data.instagramHandle !== undefined) {
      updateData.instagramHandle = data.instagramHandle ? sanitizeInput(data.instagramHandle) : null;
    }
    if (data.tiktokHandle !== undefined) {
      updateData.tiktokHandle = data.tiktokHandle ? sanitizeInput(data.tiktokHandle) : null;
    }

    const restaurant = await prisma.restaurant.update({
      where: { id: session.restaurantId },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        contactEmail: true,
        contactPhone: true,
        address: true,
        facebookUrl: true,
        instagramHandle: true,
        tiktokHandle: true,
        isActive: true
      }
    });

    console.log('[RESTAURANT INFO UPDATED]', { id: session.restaurantId, name: restaurant.name });

    return NextResponse.json({
      success: true,
      restaurant
    });

  } catch (error) {
    console.error('Update restaurant info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
