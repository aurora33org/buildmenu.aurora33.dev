import { z } from 'zod';

export const updateRestaurantInfoSchema = z.object({
  name: z.string().min(1, 'Restaurant name is required').max(100, 'Name must be less than 100 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().nullable(),
  contactEmail: z.string().email('Invalid email address').optional().nullable(),
  contactPhone: z.string().max(20, 'Phone must be less than 20 characters').optional().nullable(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional().nullable(),
  facebookUrl: z.string().url('Invalid Facebook URL').optional().nullable(),
  instagramHandle: z.string().max(50, 'Instagram handle must be less than 50 characters').optional().nullable(),
  tiktokHandle: z.string().max(50, 'TikTok handle must be less than 50 characters').optional().nullable(),
});

export type UpdateRestaurantInfo = z.infer<typeof updateRestaurantInfoSchema>;
