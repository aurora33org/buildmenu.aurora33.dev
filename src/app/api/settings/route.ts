import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getSessionFromCookie } from '@/lib/auth/session';

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

    const updateData: any = {};

    if (template_id !== undefined) updateData.templateId = template_id;
    if (primary_color !== undefined) updateData.primaryColor = primary_color;
    if (secondary_color !== undefined) updateData.secondaryColor = secondary_color;
    if (accent_color !== undefined) updateData.accentColor = accent_color;
    if (background_color !== undefined) updateData.backgroundColor = background_color;
    if (text_color !== undefined) updateData.textColor = text_color;
    if (font_heading !== undefined) updateData.fontHeading = font_heading;
    if (font_body !== undefined) updateData.fontBody = font_body;

    const settings = await prisma.restaurantSettings.update({
      where: { restaurantId: session.restaurantId },
      data: updateData
    });

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
