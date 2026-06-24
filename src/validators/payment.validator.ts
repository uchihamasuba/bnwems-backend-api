import { z } from 'zod';

export const getPaymentsByOrderSchema = z.object({
  params: z.object({
    orderId: z.string().uuid('Invalid order ID').optional(),
  }),
});

export const requestPaymentSchema = z.object({
  params: z.object({
    orderId: z.string().uuid('Invalid order ID').optional(),
  }),
  body: z.object({
    orderId: z.string().uuid('Invalid order ID').optional(),
    amount: z.number().positive('Amount must be positive'),
    paymentType: z.string().min(1, 'Payment type is required'),
    paymentMethod: z.string().min(1, 'Payment method is required'),
  }),
});

export const confirmPaymentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid payment ID'),
  }),
  body: z.object({
    status: z.string().min(1, 'Status is required'),
    evidenceUrl: z.string().url('Invalid URL format').optional(),
  }),
});
