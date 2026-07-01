import { z } from 'zod';

// ============================================================================
// CATALOG CATEGORY
// ============================================================================

export const getCatalogCategoriesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    search: z.string().optional(),
    isActive: z.string().optional(), // 'true' or 'false'
  }),
});

export const getCatalogCategoryByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});

export const createCatalogCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    displayOrder: z.number().int().optional(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateCatalogCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    displayOrder: z.number().int().optional(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateCatalogCategoryStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
});

// ============================================================================
// CATALOG ITEM
// ============================================================================

export const getCatalogItemsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    search: z.string().optional(),
    itemType: z.string().optional(),
    categoryId: z.string().regex(/^\d+$/, 'Invalid categoryId format').optional(),
    isActive: z.string().optional(),
  }),
});

export const getCatalogItemByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});

export const createCatalogItemSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    itemType: z.enum(['SERVICE', 'EQUIPMENT', 'MATERIAL', 'PACKAGE']),
    basePrice: z.number().min(0, 'basePrice must be >= 0'),
    categoryId: z.string().regex(/^\d+$/, 'Invalid format').or(z.number()).optional().nullable(),
  }),
});

export const updateCatalogItemSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    description: z.string().optional(),
    basePrice: z.number().min(0, 'basePrice must be >= 0').optional(),
    categoryId: z.string().regex(/^\d+$/, 'Invalid format').or(z.number()).optional().nullable(),
  }),
});

export const updateCatalogItemStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
});
