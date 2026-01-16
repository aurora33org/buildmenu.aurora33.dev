import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { validateSlugFormat } from '@/lib/utils/slug';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!validateSlugFormat(slug)) {
      return NextResponse.json({
        available: false,
        slug,
        reason: 'Formato inválido. Usa solo letras minúsculas, números y guiones.',
      });
    }

    // Check if slug exists in database
    const existing = await prisma.restaurant.findFirst({
      where: {
        slug: slug,
        deletedAt: null
      },
      select: { id: true }
    });

    return NextResponse.json({
      available: !existing,
      slug,
      reason: existing ? 'Este slug ya está en uso' : undefined,
    });

  } catch (error) {
    console.error('Check slug error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
