import { z } from 'zod';

export const getRevenueReportSchema = z.object({
  query: z.object({
    startDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid start date format' }),
    endDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid end date format' }),
  }),
});

export const getInventoryReportSchema = z.object({
  query: z.object({
    startDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid start date format' }).optional(),
    endDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid end date format' }).optional(),
  }),
});

export const getVerificationReportSchema = z.object({
  query: z.object({
    orderId: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});
