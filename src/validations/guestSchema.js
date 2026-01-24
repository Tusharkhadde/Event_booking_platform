import { z } from 'zod';

export const guestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  category: z.enum(['vip', 'family', 'friends', 'colleague', 'other']).default('friends'),
  rsvp_status: z.enum(['pending', 'accepted', 'declined']).default('pending'),
  plus_ones: z.string().transform((val) => parseInt(val, 10) || 0),
  dietary_restrictions: z.string().optional(),
  table_number: z.string().optional(),
});