import { z } from 'zod';

export const getWarehouseHistoriesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    transactionType: z.string().optional(),
  }),
});

export const checkoutWarehouseSchema = z.object({
  body: z.object({
    warehouseId: z.string().regex(/^\d+$/, 'Invalid ID format'),
    orderId: z.string().regex(/^\d+$/, 'Invalid ID format'),
    items: z.array(z.object({
      catalogItemId: z.string().regex(/^\d+$/, 'Invalid ID format'),
      quantity: z.number().int().positive('Quantity must be positive'),
    })).min(1, 'Items cannot be empty'),
  }),
});

export const returnWarehouseSchema = z.object({
  body: z.object({
    warehouseId: z.string().regex(/^\d+$/, 'Invalid ID format'),
    orderId: z.string().regex(/^\d+$/, 'Invalid ID format'),
    items: z.array(z.object({
      catalogItemId: z.string().regex(/^\d+$/, 'Invalid ID format'),
      quantity: z.number().int().positive('Quantity must be positive'),
      condition: z.string().optional(),
    })).min(1, 'Items cannot be empty'),
  }),
});
