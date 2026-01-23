import { z } from 'zod';

export const planningNoteSchema = z.object({
  section_id: z.string().min(1, 'Section is required'),
  content: z.string().optional(),
});

export const planningItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  section_id: z.string().min(1, 'Section is required'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  due_date: z.string().optional(),
  is_completed: z.boolean().default(false),
});

export const planningTemplateSchema = z.object({
  template_type: z.enum(['wedding', 'party', 'corporate', 'other']),
  template_data: z.record(z.any()).optional(),
});