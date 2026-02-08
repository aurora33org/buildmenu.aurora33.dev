import prisma from '../db/prisma';

/**
 * Track bandwidth usage for a restaurant
 * Non-blocking, async operation
 *
 * @param restaurantId - ID of the restaurant
 * @param bytes - Number of bytes transferred
 * @param isUniqueVisitor - Whether this is a unique visitor
 */
export async function trackBandwidth(
  restaurantId: string,
  bytes: number,
  isUniqueVisitor: boolean = false
): Promise<void> {
  try {
    // Get today's date at midnight UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Check if record exists for today
    const existing = await prisma.usageMetric.findFirst({
      where: {
        restaurantId: restaurantId,
        date: today
      },
      select: { id: true }
    });

    if (existing) {
      // Update existing record
      await prisma.usageMetric.update({
        where: { id: existing.id },
        data: {
          pageViews: { increment: 1 },
          uniqueVisitors: { increment: isUniqueVisitor ? 1 : 0 },
          bandwidthBytes: { increment: bytes }
        }
      });
    } else {
      // Create new record
      await prisma.usageMetric.create({
        data: {
          restaurantId: restaurantId,
          date: today,
          pageViews: 1,
          uniqueVisitors: isUniqueVisitor ? 1 : 0,
          bandwidthBytes: bytes
        }
      });
    }
  } catch (error) {
    console.error('[BANDWIDTH TRACKING ERROR]', error);
    // Don't throw - tracking should not break the app
  }
}

/**
 * Get bandwidth stats for a restaurant
 *
 * @param restaurantId - ID of the restaurant
 * @param days - Number of days to look back (default: 30)
 * @returns Object with bandwidth statistics
 */
export async function getBandwidthStats(restaurantId: string, days: number = 30) {
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - days);
  daysAgo.setUTCHours(0, 0, 0, 0);

  const stats = await prisma.usageMetric.aggregate({
    where: {
      restaurantId: restaurantId,
      date: { gte: daysAgo }
    },
    _sum: {
      pageViews: true,
      uniqueVisitors: true,
      bandwidthBytes: true
    },
    _count: {
      date: true
    }
  });

  // Count distinct dates
  const distinctDates = await prisma.usageMetric.groupBy({
    by: ['date'],
    where: {
      restaurantId: restaurantId,
      date: { gte: daysAgo }
    }
  });

  return {
    totalViews: stats._sum.pageViews || 0,
    totalUnique: stats._sum.uniqueVisitors || 0,
    totalBytes: Number(stats._sum.bandwidthBytes || 0),
    totalMB: Math.round((Number(stats._sum.bandwidthBytes || 0) / (1024 * 1024)) * 10) / 10, // Round to 1 decimal
    daysTracked: distinctDates.length,
  };
}

/**
 * Get views for last N days
 *
 * @param restaurantId - ID of the restaurant
 * @param days - Number of days to look back (default: 7)
 * @returns Total views in the last N days
 */
export async function getViewsLastNDays(restaurantId: string, days: number = 7): Promise<number> {
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - days);
  daysAgo.setUTCHours(0, 0, 0, 0);

  const result = await prisma.usageMetric.aggregate({
    where: {
      restaurantId: restaurantId,
      date: { gte: daysAgo }
    },
    _sum: {
      pageViews: true
    }
  });

  return result._sum.pageViews || 0;
}

/**
 * Get total views across all restaurants
 *
 * @returns Total views across all time
 */
export async function getTotalViewsAllRestaurants(): Promise<number> {
  const result = await prisma.usageMetric.aggregate({
    _sum: {
      pageViews: true
    }
  });

  return result._sum.pageViews || 0;
}
