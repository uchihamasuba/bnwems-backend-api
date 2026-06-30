import { z } from 'zod';

export const getInventorySchema = z.object({
  query: z.object({
    warehouseId: z.string().regex(/^\d+$/, 'Invalid ID format').optional(),
    catalogItemId: z.string().regex(/^\d+$/, 'Invalid ID format').optional(),
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
  }),
});

export const checkAvailabilitySchema = z.object({
  query: z.object({
    eventDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
    itemId: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});

export const reserveInventorySchema = z.object({
  body: z.object({
    orderId: z.string().regex(/^\d+$/, 'Invalid ID format'),
    items: z.array(z.object({
      equipmentItemId: z.string().regex(/^\d+$/, 'Invalid ID format'),
      quantity: z.number().int().positive('Quantity must be positive'),
    })).min(1, 'Items cannot be empty'),
  }),
});

export const getInventoryReportsSchema = z.object({
  query: z.object({
    reportType: z.enum(['checkout', 'return', 'adjustment', 'damage_loss']).optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export const checkoutInventorySchema = z.object({
  body: z.object({
    orderId: z.number().int().positive(),
    items: z.array(z.object({
      equipmentItemId: z.number().int().positive(),
      quantity: z.number().int().positive(),
    })).min(1),
  }),
});

export const returnInventorySchema = z.object({
  body: z.object({
    orderId: z.number().int().positive(),
    items: z.array(z.object({
      equipmentItemId: z.number().int().positive(),
      quantity: z.number().int().positive(),
      condition: z.enum(['good', 'damaged', 'lost']).optional(),
    })).min(1),
  }),
});
