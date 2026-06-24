import { z } from 'zod';

export const recordDamageLossSchema = z.object({
  params: z.object({
    orderId: z.string().uuid('Invalid order ID'),
  }),
  body: z.object({
    reportDetails: z.object({
      items: z.array(z.object({
        responsible: z.string().min(1, 'Responsible party is required'),
      }).passthrough()).min(1, 'Missing report details.'),
    }),
    evidences: z.array(z.object({
      fileUrl: z.string().url('Invalid URL format'),
    })).min(1, 'Missing evidence for damage/loss report.'),
  }),
});
