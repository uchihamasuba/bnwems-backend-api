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
    id: z.string().uuid('Invalid order ID'),
  }),
});

export const createOrderSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid customer ID'),
    eventDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
    venueAddress: z.string().optional(),
  }),
});

export const confirmOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID'),
  }),
});

export const changeEventDateSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID'),
  }),
  body: z.object({
    newEventDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
  }),
});

export const closeOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID'),
  }),
});
