import { z } from 'zod';

export const recordDamageLossSchema = z.object({
  params: z.object({
    orderId: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    reportDetails: z.object({
      items: z.array(z.object({
        responsibleParty: z.string().min(1, 'Responsible party is required'),
        responsibleUserId: z.union([z.number(), z.string()]).optional(),
      }).passthrough()).min(1, 'Missing report details.'),
    }),
    evidences: z.array(z.object({
      fileUrl: z.string().url('Invalid URL format'),
    })).min(1, 'Missing evidence for damage/loss report.'),
  }),
});
