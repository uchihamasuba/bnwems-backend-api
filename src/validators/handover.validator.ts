import { z } from 'zod';

export const recordHandoverSchema = z.object({
  params: z.object({
    orderId: z.string().uuid('Invalid order ID'),
  }),
  body: z.object({
    customerAgreed: z.boolean(),
    notes: z.string().optional(),
    evidences: z.array(z.object({
      fileUrl: z.string().url('Invalid URL format'),
    })).min(1, 'Missing customer signature/evidence for handover.'),
  }),
});
