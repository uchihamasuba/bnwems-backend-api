import { z } from 'zod';
import { QuotationStatus } from '@prisma/client';

export const getCustomerQuotationsSchema = z.object({
  params: z.object({
    customerId: z.string().regex(/^\d+$/, 'Invalid customerId'),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export const getQuotationByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});

export const createQuotationSchema = z.object({
  params: z.object({
    customerId: z.string().regex(/^\d+$/, 'Invalid customerId'),
  }),
  body: z.object({
    version: z.string().min(1),
    notes: z.string().optional(),
    items: z
      .array(
        z.object({
          itemId: z.number().int().positive(),
          quantity: z.number().int().positive(),
          price: z.number().min(0),
          discount: z.number().min(0).optional(),
        }),
      )
      .min(1, 'At least one item is required'),
  }),
});

export const updateQuotationSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    notes: z.string().optional(),
    items: z
      .array(
        z.object({
          itemId: z.number().int().positive(),
          quantity: z.number().int().positive(),
          price: z.number().min(0),
          discount: z.number().min(0).optional(),
        }),
      )
      .min(1, 'At least one item is required'),
  }),
});

export const updateQuotationStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    status: z.nativeEnum(QuotationStatus),
  }),
});

export const deleteQuotationSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});
