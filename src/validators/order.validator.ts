import { z } from 'zod';

export const getOrdersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    search: z.string().optional(),
    status: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const getOrderByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});

export const createOrderSchema = z.object({
  body: z.object({
    customerId: z.string().regex(/^\d+$/, 'Invalid ID format'),
    eventDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
    eventEndDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date format' }).optional(),
    eventType: z.string().optional(),
    guestCount: z.union([z.number(), z.string().regex(/^\d+$/)]).optional(),
    venueAddress: z.string().optional(),
  }),
});

export const confirmOrderSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});

export const changeEventDateSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    newEventDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
  }),
});

export const closeOrderSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});

export const getOrderEvidencesSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});

export const getMobileSummarySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});

export const getWorkflowTimelineSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});
