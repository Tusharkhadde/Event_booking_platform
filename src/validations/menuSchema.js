import { z } from 'zod';

export const menuSchema = z.object({
  name: z.string().min(1, 'Menu name is required'),
  type: z.enum(['veg', 'non-veg', 'vegan', 'mixed', 'custom']).default('mixed'),
  description: z.string().optional(),
  price_per_person: z.string().optional().transform((val) => parseFloat(val) || 0),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, 'Dish name is required'),
  description: z.string().optional(),
  category: z.enum(['appetizer', 'soup', 'salad', 'main', 'side', 'dessert', 'beverage', 'other']).default('main'),
  is_vegetarian: z.boolean().default(false),
  is_vegan: z.boolean().default(false),
  is_gluten_free: z.boolean().default(false),
  price: z.string().optional().transform((val) => parseFloat(val) || 0),
});