import { z } from 'zod';
import { SupplierStatus, TransactionStatus, PaymentStatus, TransactionType } from '@prisma/client';

export const getSuppliersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().optional(),
    status: z.nativeEnum(SupplierStatus).optional(),
  }),
});

export const createSupplierSchema = z.object({
  body: z.object({
    supplierCode: z.string().min(1),
    supplierName: z.string().min(1),
    serviceType: z.string().min(1),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
  }),
});

export const updateSupplierSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    supplierName: z.string().min(1).optional(),
    serviceType: z.string().min(1).optional(),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    status: z.nativeEnum(SupplierStatus).optional(),
  }),
});

export const createSupplierTransactionSchema = z.object({
  body: z.object({
    supplierId: z.number().int().positive(),
    orderId: z.number().int().positive(),
    transactionType: z.nativeEnum(TransactionType),
    serviceTitle: z.string().min(1),
    depositAmount: z.number().min(0).optional(),
    items: z
      .array(
        z.object({
          itemId: z.number().int().positive().optional(), // Can be optional if it's a non-catalog item, wait.
          itemName: z.string().min(1), // Since item ID might not exist, we need name
          quantity: z.number().int().positive(),
          unitCost: z.number().min(0),
          notes: z.string().optional(),
        }),
      )
      .min(1),
  }),
});

export const getSupplierTransactionsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    supplierId: z.string().regex(/^\d+$/).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    status: z.nativeEnum(TransactionStatus).optional(),
  }),
});

export const getSupplierTransactionByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
});

export const updateSupplierTransactionStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    status: z.nativeEnum(TransactionStatus),
    notes: z.string().optional(),
  }),
});

export const updateSupplierTransactionPaymentStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    paymentStatus: z.nativeEnum(PaymentStatus),
  }),
});

export const receiveSupplierTransactionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    items: z
      .array(
        z.object({
          stItemId: z.number().int().positive(),
          receivedQuantity: z.number().int().min(0),
        }),
      )
      .min(1),
  }),
});
