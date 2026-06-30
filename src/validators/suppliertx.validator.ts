import { z } from 'zod';

export const getSupplierTransactionsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    supplierId: z.string().regex(/^\d+$/).optional(),
    orderId: z.string().regex(/^\d+$/).optional(),
    status: z.string().optional(),
  }),
});

export const getSupplierTransactionByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});

export const createSupplierTransactionSchema = z.object({
  body: z.object({
    supplierId: z.string().regex(/^\d+$/, 'Invalid ID format'),
    orderId: z.string().regex(/^\d+$/, 'Invalid ID format').optional(),
    transactionType: z.string().min(1, 'Transaction type is required'),
    totalCost: z.number().min(0, 'Total cost must be non-negative'),
    items: z.any().optional(),
    details: z.any().optional(),
  }),
});

export const receiveSupplierItemsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    receivedItems: z.any().optional(),
    evidenceUrls: z.array(z.string().url('Invalid URL format')).optional(),
  }),
});

export const returnSupplierItemsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    returnedItems: z.any().optional(),
    condition: z.string().optional(),
    evidenceUrls: z.array(z.string().url('Invalid URL format')).optional(),
  }),
});

export const updateSupplierTxStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    status: z.string().min(1, 'Status is required'),
    evidenceUrls: z.array(z.string().url('Invalid URL format')).optional(),
  }),
});

export const getSupplierDebtsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    status: z.string().optional(),
    supplierId: z.string().regex(/^\d+$/, 'Invalid ID format').optional(),
  }),
});

export const paySupplierDebtSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    paymentRef: z.string().optional(),
  }),
});
