import { z } from 'zod';

export const createTenantSchema = z.object({
  // Restaurant data
  restaurantName: z.string().min(2, 'El nombre del restaurante debe tener al menos 2 caracteres'),
  slug: z
    .string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .max(50, 'El slug no puede tener más de 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  description: z.string().optional(),
  contactEmail: z.string().email('Email de contacto inválido').optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),

  // User data
  userName: z.string().min(2, 'El nombre del usuario debe tener al menos 2 caracteres'),
  userEmail: z.string().email('Email del usuario inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),

  // Settings
  templateId: z.enum(['classic', 'modern', 'elegant', 'minimal']).default('classic'),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;

// SIMPLIFIED SCHEMA: Only create user, NO restaurant (for new onboarding flow)
export const createTenantSimpleSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
});

export type CreateTenantSimpleInput = z.infer<typeof createTenantSimpleSchema>;
