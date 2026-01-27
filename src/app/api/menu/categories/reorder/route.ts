import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getSessionFromCookie } from '@/lib/auth/session';
import { reorderCategoriesSchema } from '@/lib/validations/menu.schema';

export async function POST(request: NextRequest) {
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
    const validation = reorderCategoriesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { categoryIds } = validation.data;

    // Update display_order for each category in a transaction
    await prisma.$transaction(
      categoryIds.map((categoryId, index) =>
        prisma.category.updateMany({
          where: {
            id: categoryId,
            restaurantId: session.restaurantId
          },
          data: {
            displayOrder: index
          }
        })
      )
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Reorder categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
