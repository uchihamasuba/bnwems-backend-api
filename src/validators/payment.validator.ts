import { z } from 'zod';

export const getPaymentsByOrderSchema = z.object({
  params: z.object({
    orderId: z.string().regex(/^\d+$/, 'Invalid ID format').optional(),
  }),
});

export const requestPaymentSchema = z.object({
  params: z.object({
    orderId: z.string().regex(/^\d+$/, 'Invalid ID format').optional(),
  }),
  body: z.object({
    orderId: z.string().regex(/^\d+$/, 'Invalid ID format').optional(),
    amount: z.number().positive('Amount must be positive'),
    paymentType: z.string().min(1, 'Payment type is required'),
    paymentMethod: z.string().min(1, 'Payment method is required'),
  }),
});

export const confirmPaymentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    status: z.string().min(1, 'Status is required'),
    evidenceUrl: z.string().url('Invalid URL format').optional(),
  }),
});
