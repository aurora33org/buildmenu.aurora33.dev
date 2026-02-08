import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getSessionFromCookie } from '@/lib/auth/session';
import { reorderItemsSchema } from '@/lib/validations/menu.schema';

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

    const restaurantId = session.restaurantId;

    const body = await request.json();
    const validation = reorderItemsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { itemIds, categoryId } = validation.data;

    // Update display_order for each item within the category in a transaction
    await prisma.$transaction(
      itemIds.map((itemId, index) =>
        prisma.menuItem.updateMany({
          where: {
            id: itemId,
            categoryId: categoryId,
            restaurantId: restaurantId
          },
          data: {
            displayOrder: index
          }
        })
      )
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Reorder items error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
