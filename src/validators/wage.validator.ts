import { z } from 'zod';

export const getWagesSummarySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    period: z.string().optional(),
    userId: z.string().regex(/^\d+$/, 'Invalid ID format').optional(),
    status: z.string().optional(),
  }),
});

export const confirmWageSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    status: z.string().min(1, 'Status is required'),
  }),
});
