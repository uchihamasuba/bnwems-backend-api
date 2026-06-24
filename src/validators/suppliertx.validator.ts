import { z } from 'zod';

export const createSupplierTransactionSchema = z.object({
  body: z.object({
    supplierId: z.string().uuid('Invalid supplier ID'),
    orderId: z.string().uuid('Invalid order ID').optional(),
    transactionType: z.string().min(1, 'Transaction type is required'),
    totalCost: z.number().min(0, 'Total cost must be non-negative'),
    details: z.any(),
  }),
});

export const receiveSupplierItemsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid transaction ID'),
  }),
  body: z.object({
    receivedItems: z.any().optional(),
    evidenceUrls: z.array(z.string().url('Invalid URL format')).optional(),
  }),
});

export const returnSupplierItemsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid transaction ID'),
  }),
  body: z.object({
    returnedItems: z.any().optional(),
    condition: z.string().optional(),
    evidenceUrls: z.array(z.string().url('Invalid URL format')).optional(),
  }),
});

export const getSupplierDebtsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    status: z.string().optional(),
    supplierId: z.string().uuid('Invalid supplier ID').optional(),
  }),
});

export const paySupplierDebtSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid debt ID'),
  }),
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    paymentRef: z.string().optional(),
  }),
});
