import { z } from 'zod';

// Step 1: User full name
export const onboardingStep1Schema = z.object({
  fullName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
});

// Step 2: Restaurant info
export const onboardingStep2Schema = z.object({
  restaurantName: z
    .string()
    .min(2, 'El nombre del restaurante debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  slug: z
    .string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .max(50, 'El slug no puede tener más de 50 caracteres')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'El slug solo puede contener letras minúsculas, números y guiones (sin espacios, sin guiones al inicio/final)'
    ),
  description: z
    .string()
    .max(500, 'La descripción no puede tener más de 500 caracteres')
    .optional(),
});

// Step 3: Contact & Social
export const onboardingStep3Schema = z.object({
  contactEmail: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  contactPhone: z
    .string()
    .max(20, 'El teléfono no puede tener más de 20 caracteres')
    .optional(),
  address: z
    .string()
    .max(200, 'La dirección no puede tener más de 200 caracteres')
    .optional(),
  facebookUrl: z
    .string()
    .url('URL de Facebook inválida')
    .optional()
    .or(z.literal('')),
  instagramHandle: z
    .string()
    .regex(
      /^@?[a-zA-Z0-9._]+$/,
      'Usuario de Instagram inválido (solo letras, números, puntos y guiones bajos)'
    )
    .optional()
    .or(z.literal('')),
  tiktokHandle: z
    .string()
    .regex(
      /^@?[a-zA-Z0-9._]+$/,
      'Usuario de TikTok inválido (solo letras, números, puntos y guiones bajos)'
    )
    .optional()
    .or(z.literal('')),
});

// Step 4: Template selection
export const onboardingStep4Schema = z.object({
  templateId: z.enum(['classic', 'modern', 'elegant', 'minimal'], {
    required_error: 'Debes seleccionar un template',
  }),
});

// Complete onboarding (all steps combined)
export const completeOnboardingSchema = z.object({
  fullName: z.string().min(2).max(100),
  restaurantName: z.string().min(2).max(100),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(500).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  instagramHandle: z
    .string()
    .regex(/^@?[a-zA-Z0-9._]+$/)
    .optional()
    .or(z.literal('')),
  tiktokHandle: z
    .string()
    .regex(/^@?[a-zA-Z0-9._]+$/)
    .optional()
    .or(z.literal('')),
  templateId: z.enum(['classic', 'modern', 'elegant', 'minimal']),
});

// Type exports
export type OnboardingStep1Input = z.infer<typeof onboardingStep1Schema>;
export type OnboardingStep2Input = z.infer<typeof onboardingStep2Schema>;
export type OnboardingStep3Input = z.infer<typeof onboardingStep3Schema>;
export type OnboardingStep4Input = z.infer<typeof onboardingStep4Schema>;
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
