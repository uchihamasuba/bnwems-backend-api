import { z } from 'zod';

export const getQuotationsByOrderSchema = z.object({
  params: z.object({
    orderId: z.string().regex(/^\d+$/, 'Invalid ID format').optional(), // Sometimes it's mounted on /quotations
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
  }),
});

export const getQuotationByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});

export const createQuotationSchema = z.object({
  params: z.object({
    orderId: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    subtotal: z.number().min(0, 'Subtotal must be non-negative'),
    tax: z.number().min(0).optional(),
    discount: z.number().min(0).optional(),
    totalAmount: z.number().min(0, 'Total amount must be non-negative'),
    details: z.any().optional(),
  }),
});

export const updateQuotationSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    subtotal: z.number().min(0).optional(),
    tax: z.number().min(0).optional(),
    discount: z.number().min(0).optional(),
    totalAmount: z.number().min(0).optional(),
    details: z.any().optional(),
  }),
});

export const deleteQuotationSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});

export const confirmQuotationSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});
