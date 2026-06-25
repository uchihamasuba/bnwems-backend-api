import { z } from 'zod';

export const recordSettlementSchema = z.object({
  params: z.object({
    orderId: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    originalValue: z.number().min(0, 'Original value must be non-negative'),
    additionalFees: z.number().min(0).optional(),
    compensation: z.number().min(0).optional(),
    paidAmount: z.number().min(0).optional(),
    remainingAmount: z.number(),
    evidences: z.array(z.object({
      fileUrl: z.string().url('Invalid URL format'),
    })).optional(),
  }),
});

export const confirmSettlementSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    status: z.string().min(1, 'Status is required'),
  }),
});
