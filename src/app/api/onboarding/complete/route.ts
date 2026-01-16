import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getSessionFromCookie } from '@/lib/auth/session';
import { completeOnboardingSchema } from '@/lib/validations/onboarding.schema';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const cookieHeader = request.headers.get('cookie');
    const session = await getSessionFromCookie(cookieHeader);

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

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, email: true, name: true, restaurantId: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has a restaurant (onboarding already completed)
    if (user.restaurantId) {
      return NextResponse.json(
        { error: 'Onboarding already completed' },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existingSlug = await prisma.restaurant.findFirst({
      where: { slug: data.slug },
      select: { id: true }
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Este slug ya está en uso. Por favor elige otro.' },
        { status: 409 }
      );
    }

    // Use Prisma transaction to create restaurant, settings, and update user
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create restaurant
      const restaurant = await tx.restaurant.create({
        data: {
          ownerId: session.id,
          name: data.restaurantName,
          slug: data.slug,
          description: data.description || null,
          contactEmail: data.contactEmail || null,
          contactPhone: data.contactPhone || null,
          address: data.address || null,
          facebookUrl: data.facebookUrl || null,
          instagramHandle: data.instagramHandle || null,
          tiktokHandle: data.tiktokHandle || null,
          onboardingCompleted: true,
          onboardingCompletedAt: new Date(),
          isActive: true
        }
      });

      // 2. Create restaurant settings
      await tx.restaurantSettings.create({
        data: {
          restaurantId: restaurant.id,
          templateId: data.templateId
        }
      });

      // 3. Update user's restaurant_id and name
      await tx.user.update({
        where: { id: session.id },
        data: {
          restaurantId: restaurant.id,
          name: data.fullName
        }
      });

      return restaurant;
    });

    console.log('[ONBOARDING COMPLETED]', {
      userId: session.id,
      restaurantId: result.id,
      slug: data.slug,
    });

    return NextResponse.json({
      success: true,
      restaurant: {
        id: result.id,
        name: result.name,
        slug: result.slug,
        onboarding_completed: result.onboardingCompleted
      },
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
