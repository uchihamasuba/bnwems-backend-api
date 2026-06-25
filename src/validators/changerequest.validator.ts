import { z } from 'zod';

export const createChangeRequestSchema = z.object({
  params: z.object({
    orderId: z.string().regex(/^\d+$/, 'Invalid ID format').optional(),
  }),
  body: z.object({
    orderId: z.string().regex(/^\d+$/, 'Invalid ID format').optional(),
    requestDetails: z.string().min(1, 'Request details are required'),
    additionalCost: z.number().min(0, 'Additional cost must be non-negative').optional(),
  }),
});

export const approveChangeRequestSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
  }),
});
