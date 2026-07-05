import { z } from 'zod';

export const getChangeRequestsSchema = z.object({
  query: z.object({
    orderId: z.string().regex(/^\d+$/, 'Invalid ID format').optional(),
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    page: z.string().regex(/^\d+$/, 'Invalid page format').optional(),
    limit: z.string().regex(/^\d+$/, 'Invalid limit format').optional(),
  }),
});

export const getChangeRequestByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});

export const createChangeRequestSchema = z.object({
  params: z.object({
    orderId: z.string().regex(/^\d+$/, 'Invalid ID format').optional(),
  }),
  body: z.object({
    orderId: z.string().regex(/^\d+$/, 'Invalid ID format').optional(),
    type: z.enum(['add', 'remove', 'replace']),
    reason: z.string().optional(),
    estimatedCost: z.number().optional(),
    items: z.array(z.object({
      equipmentItemId: z.number().int().positive(),
      quantity: z.number().int().positive(),
      action: z.enum(['add', 'remove']),
    })).min(1, 'At least one item is required'),
  }),
});

export const approveChangeRequestSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    status: z.enum(['approved', 'rejected']),
  }),
});
