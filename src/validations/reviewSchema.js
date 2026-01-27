// src/validations/reviewSchema.js
import { z } from 'zod';

export const eventReviewSchema = z.object({
  rating: z
    .number({
      required_error: 'Rating is required',
      invalid_type_error: 'Rating must be a number',
    })
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  comment: z
    .string()
    .min(5, 'Comment should be at least 5 characters')
    .max(1000, 'Comment is too long'),
});