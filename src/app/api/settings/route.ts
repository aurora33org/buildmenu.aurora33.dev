import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getSessionFromCookie } from '@/lib/auth/session';
import { updateSettingsSchema } from '@/lib/validations/settings.schema';

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

    const settings = await prisma.restaurantSettings.findUnique({
      where: { restaurantId: session.restaurantId }
    });

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
    const session = await getSessionFromCookie(cookieHeader);

    if (!session || !session.restaurantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = updateSettingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Build update object with validated data
    const updateData: any = {};

    if (data.template_id !== undefined) updateData.templateId = data.template_id;
    if (data.primary_color !== undefined) updateData.primaryColor = data.primary_color;
    if (data.secondary_color !== undefined) updateData.secondaryColor = data.secondary_color;
    if (data.accent_color !== undefined) updateData.accentColor = data.accent_color;
    if (data.background_color !== undefined) updateData.backgroundColor = data.background_color;
    if (data.text_color !== undefined) updateData.textColor = data.text_color;
    if (data.font_heading !== undefined) updateData.fontHeading = data.font_heading;
    if (data.font_body !== undefined) updateData.fontBody = data.font_body;

    const settings = await prisma.restaurantSettings.update({
      where: { restaurantId: session.restaurantId },
      data: updateData
    });

    console.log('[SETTINGS UPDATED]', { restaurantId: session.restaurantId });

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
