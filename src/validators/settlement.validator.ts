import { z } from 'zod';

export const recordSettlementSchema = z.object({
  params: z.object({
    orderId: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    originalValue: z.number().min(0, 'Original value must be non-negative'),
    changeAdjustment: z.number().optional(),
    additionalFee: z.number().min(0).optional(),
    compensation: z.number().min(0).optional(),
    discount: z.number().min(0).optional(),
    totalAmount: z.number().min(0).optional(),
    totalPaid: z.number().min(0).optional(),
    remainingAmount: z.number(),
    settlementLines: z.array(z.object({
      lineType: z.enum(['original','change','additional_fee','compensation','deposit','payment']),
      amount: z.number(),
      note: z.string().optional()
    })).optional(),
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

export const getSettlementByOrderSchema = z.object({
  params: z.object({
    orderId: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});
