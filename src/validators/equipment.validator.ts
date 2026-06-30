import { z } from 'zod';

export const getEquipmentsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    search: z.string().optional(),
    itemType: z.enum(['EQUIPMENT', 'FOOD', 'BEVERAGE', 'SERVICE'] as const, { message: 'Invalid itemType' }).optional(),
    isActive: z.enum(['true', 'false']).optional(),
  }),
});

export const getEquipmentByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});

export const createEquipmentSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    itemType: z.enum(['EQUIPMENT', 'FOOD', 'BEVERAGE', 'SERVICE'] as const, { message: 'Invalid itemType' }),
    basePrice: z.number().positive('Base price must be positive'),
  }),
});

export const updateEquipmentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    basePrice: z.number().positive('Base price must be positive'),
  }),
});

export const deactivateEquipmentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
});
