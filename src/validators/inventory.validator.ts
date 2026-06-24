import { z } from 'zod';

export const getInventorySchema = z.object({
  query: z.object({
    warehouseId: z.string().uuid('Invalid warehouse ID').optional(),
    catalogItemId: z.string().uuid('Invalid catalog item ID').optional(),
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
  }),
});

export const checkAvailabilitySchema = z.object({
  query: z.object({
    eventDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
    itemId: z.string().uuid('Invalid item ID'),
  }),
});

export const reserveInventorySchema = z.object({
  body: z.object({
    orderId: z.string().uuid('Invalid order ID'),
    items: z.array(z.object({
      catalogItemId: z.string().uuid('Invalid catalog item ID'),
      quantity: z.number().int().positive('Quantity must be positive'),
    })).min(1, 'Items cannot be empty'),
  }),
});
