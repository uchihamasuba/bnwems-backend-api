import { z } from 'zod';

export const getQuotationsByOrderSchema = z.object({
  params: z.object({
    orderId: z.string().uuid('Invalid order ID').optional(), // Sometimes it's mounted on /quotations
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
  }),
});

export const getQuotationByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid quotation ID'),
  }),
});

export const createQuotationSchema = z.object({
  params: z.object({
    orderId: z.string().uuid('Invalid order ID'),
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
    id: z.string().uuid('Invalid quotation ID'),
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
    id: z.string().uuid('Invalid quotation ID'),
  }),
});

export const confirmQuotationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid quotation ID'),
  }),
});
