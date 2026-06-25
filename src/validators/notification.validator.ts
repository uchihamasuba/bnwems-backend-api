import { z } from 'zod';

export const getNotificationsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    isRead: z.enum(['true', 'false']).optional(),
  }),
});

export const markAsReadSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});
