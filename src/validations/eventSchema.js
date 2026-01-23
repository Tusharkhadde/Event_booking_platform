import { z } from 'zod';

export const eventSchema = z.object({
  title: z
    .string()
    .min(1, 'Event title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .optional(),
  category: z
    .string()
    .min(1, 'Category is required'),
  location: z
    .string()
    .min(1, 'Location is required'),
  venue_name: z
    .string()
    .optional(),
  date: z
    .string()
    .min(1, 'Date is required'),
  start_time: z
    .string()
    .optional(),
  end_time: z
    .string()
    .optional(),
  max_attendees: z
    .number()
    .positive('Must be a positive number')
    .optional()
    .or(z.literal('')),
  is_public: z
    .boolean()
    .default(true),
  banner_url: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
});

export const eventFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});