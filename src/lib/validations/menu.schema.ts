import { z } from 'zod';

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  icon: z.string().optional(),
  displayOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// Menu item schemas
export const createMenuItemSchema = z.object({
  categoryId: z.string().uuid('ID de categoría inválido'),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  basePrice: z.number().min(0, 'El precio debe ser mayor o igual a 0').optional().nullable(),
  displayOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const updateMenuItemSchema = createMenuItemSchema.partial().omit({ categoryId: true });

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;

// Reorder schemas
export const reorderCategoriesSchema = z.object({
  categoryIds: z.array(z.string().uuid('Invalid category ID')).min(1, 'At least one category ID is required'),
});

export const reorderItemsSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  itemIds: z.array(z.string().uuid('Invalid item ID')).min(1, 'At least one item ID is required'),
});

export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;
export type ReorderItemsInput = z.infer<typeof reorderItemsSchema>;
