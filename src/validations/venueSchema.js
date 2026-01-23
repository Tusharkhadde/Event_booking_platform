import { z } from 'zod';

export const venueSchema = z.object({
  name: z
    .string()
    .min(1, 'Venue name is required')
    .min(3, 'Name must be at least 3 characters'),
  description: z
    .string()
    .optional(),
  address: z
    .string()
    .min(1, 'Address is required'),
  city: z
    .string()
    .min(1, 'City is required'),
  state: z
    .string()
    .optional(),
  capacity: z
    .string()
    .min(1, 'Capacity is required')
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
      message: 'Capacity must be a positive number',
    }),
  price_range: z
    .enum(['$', '$$', '$$$', '$$$$'])
    .default('$$'),
  amenities: z
    .string()
    .optional(),
  contact_phone: z
    .string()
    .optional(),
  contact_email: z
    .string()
    .email('Invalid email')
    .optional()
    .or(z.literal('')),
});

export const venueReviewSchema = z.object({
  rating: z
    .number()
    .min(1, 'Rating is required')
    .max(5, 'Rating must be 1-5'),
  comment: z
    .string()
    .min(1, 'Comment is required')
    .min(10, 'Comment must be at least 10 characters'),
});