import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a DOMPurify instance for server-side use
const window = new JSDOM('').window;
const purify = DOMPurify(window as unknown as Window);

/**
 * Sanitizes plain text input by removing all HTML tags
 * Use for: names, titles, short descriptions
 *
 * @param input - The text to sanitize
 * @returns Sanitized text with HTML removed
 */
export function sanitizeInput(input: string): string {
  // Remove HTML tags but keep text content
  return purify.sanitize(input, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true
  }).trim();
}

/**
 * Sanitizes HTML input by allowing only safe HTML tags
 * Use for: rich text descriptions that need formatting
 *
 * @param html - The HTML to sanitize
 * @returns Sanitized HTML with only safe tags
 */
export function sanitizeHtml(html: string): string {
  // Allow only safe HTML tags for basic formatting
  return purify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [] // No attributes allowed
  });
}

/**
 * Sanitizes an object's string properties recursively
 *
 * @param obj - Object to sanitize
 * @returns New object with sanitized string values
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}
