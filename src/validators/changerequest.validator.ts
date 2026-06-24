import { z } from 'zod';

export const createChangeRequestSchema = z.object({
  params: z.object({
    orderId: z.string().uuid('Invalid order ID').optional(),
  }),
  body: z.object({
    orderId: z.string().uuid('Invalid order ID').optional(),
    requestDetails: z.string().min(1, 'Request details are required'),
    additionalCost: z.number().min(0, 'Additional cost must be non-negative').optional(),
  }),
});

export const approveChangeRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid change request ID'),
  }),
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
  }),
});
