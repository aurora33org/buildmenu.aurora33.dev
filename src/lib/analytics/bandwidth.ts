import { getDatabase } from '../db/schema';
import { randomUUID } from 'crypto';

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
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Check if record exists for today
    const existing = db.prepare(`
      SELECT id FROM usage_metrics
      WHERE restaurant_id = ? AND date = ?
    `).get(restaurantId, today) as { id: string } | undefined;

    if (existing) {
      // Update existing record
      db.prepare(`
        UPDATE usage_metrics
        SET
          page_views = page_views + 1,
          unique_visitors = unique_visitors + ?,
          bandwidth_bytes = bandwidth_bytes + ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(isUniqueVisitor ? 1 : 0, bytes, existing.id);
    } else {
      // Create new record
      db.prepare(`
        INSERT INTO usage_metrics
        (id, restaurant_id, date, page_views, unique_visitors, bandwidth_bytes)
        VALUES (?, ?, ?, 1, ?, ?)
      `).run(randomUUID(), restaurantId, today, isUniqueVisitor ? 1 : 0, bytes);
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
export function getBandwidthStats(restaurantId: string, days: number = 30) {
  const db = getDatabase();

  const stats = db.prepare(`
    SELECT
      SUM(page_views) as total_views,
      SUM(unique_visitors) as total_unique,
      SUM(bandwidth_bytes) as total_bytes,
      COUNT(DISTINCT date) as days_tracked
    FROM usage_metrics
    WHERE restaurant_id = ?
      AND date >= date('now', '-${days} days')
  `).get(restaurantId) as {
    total_views: number | null;
    total_unique: number | null;
    total_bytes: number | null;
    days_tracked: number | null;
  } | undefined;

  return {
    totalViews: stats?.total_views || 0,
    totalUnique: stats?.total_unique || 0,
    totalBytes: stats?.total_bytes || 0,
    totalMB: Math.round((stats?.total_bytes || 0) / (1024 * 1024) * 10) / 10, // Round to 1 decimal
    daysTracked: stats?.days_tracked || 0,
  };
}

/**
 * Get views for last N days
 *
 * @param restaurantId - ID of the restaurant
 * @param days - Number of days to look back (default: 7)
 * @returns Total views in the last N days
 */
export function getViewsLastNDays(restaurantId: string, days: number = 7): number {
  const db = getDatabase();

  const result = db.prepare(`
    SELECT SUM(page_views) as views
    FROM usage_metrics
    WHERE restaurant_id = ?
      AND date >= date('now', '-${days} days')
  `).get(restaurantId) as { views: number | null } | undefined;

  return result?.views || 0;
}

/**
 * Get total views across all restaurants
 *
 * @returns Total views across all time
 */
export function getTotalViewsAllRestaurants(): number {
  const db = getDatabase();

  const result = db.prepare(`
    SELECT SUM(page_views) as total
    FROM usage_metrics
  `).get() as { total: number | null } | undefined;

  return result?.total || 0;
}
