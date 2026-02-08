import { z } from 'zod';

// Template enum matching Prisma schema
export const templateIdEnum = z.enum(['classic', 'modern', 'elegant', 'minimal']);

export const updateSettingsSchema = z.object({
  template_id: templateIdEnum.optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  background_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  text_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  font_heading: z.string().min(1, 'Font heading is required').optional(),
  font_body: z.string().min(1, 'Font body is required').optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
