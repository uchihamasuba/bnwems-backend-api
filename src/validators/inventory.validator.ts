import { z } from 'zod';
import { MovementType } from '@prisma/client';

export const getInventorySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    itemId: z.string().regex(/^\d+$/, 'Invalid itemId format').optional(),
  }),
});

export const adjustInventorySchema = z.object({
  body: z.object({
    itemId: z.number().int().positive(),
    quantityChange: z.number().int(),
    notes: z.string().optional(),
  }),
});

export const getInventoryMovementsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    itemId: z.string().regex(/^\d+$/, 'Invalid itemId format').optional(),
    movementType: z.nativeEnum(MovementType).optional(),
  }),
});

export const createReturnReportSchema = z.object({
  body: z.object({
    orderId: z.number().int().positive(),
    reportType: z.string().min(1),
    notes: z.string().optional(),
    items: z.array(
      z.object({
        itemId: z.number().int().positive(),
        goodQuantity: z.number().int().min(0),
        damagedQuantity: z.number().int().min(0),
        lostQuantity: z.number().int().min(0),
      }),
    ),
  }),
});

export const confirmReturnReportSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});
