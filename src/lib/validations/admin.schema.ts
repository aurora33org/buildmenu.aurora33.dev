import { z } from 'zod';

export const pauseTenantSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(200, 'Reason must be less than 200 characters').optional(),
});

export type PauseTenantInput = z.infer<typeof pauseTenantSchema>;
