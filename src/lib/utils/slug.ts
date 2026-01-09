/**
 * Utility functions for generating and validating URL slugs
 */

/**
 * Generate URL-friendly slug from restaurant name
 * Examples:
 * - "La Taquería" → "la-taqueria"
 * - "El Buen Sabor!" → "el-buen-sabor"
 * - "Café  Luna" → "cafe-luna"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Remove accents and special characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces and special chars with hyphens
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Replace multiple hyphens with single
    .replace(/-+/g, '-')
    // Limit length
    .substring(0, 50);
}

/**
 * Validate slug format
 * Rules:
 * - Length: 3-50 characters
 * - Only lowercase letters, numbers, hyphens
 * - Cannot start or end with hyphen
 */
export function validateSlugFormat(slug: string): boolean {
  if (!slug || slug.length < 3 || slug.length > 50) {
    return false;
  }

  // Must match: lowercase letters, numbers, hyphens (no start/end with hyphen)
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Clean and normalize slug input
 * Useful for real-time input sanitization
 */
export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
