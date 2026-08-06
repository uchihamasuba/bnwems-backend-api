import { z } from 'zod';
import { ItemStatus } from '@prisma/client';

// ============================================================================
// CATALOG CATEGORY
// ============================================================================

export const getCatalogCategoriesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    search: z.string().optional(),
  }),
});

export const createCatalogCategorySchema = z.object({
  body: z.object({
    categoryName: z.string().min(1, 'categoryName is required'),
    description: z.string().optional(),
  }),
});

export const updateCatalogCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    categoryName: z.string().min(1, 'categoryName is required'),
    description: z.string().optional(),
  }),
});

export const getCatalogCategoryByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
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
// CATALOG TYPE
// ============================================================================

export const getCatalogTypesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    search: z.string().optional(),
    categoryId: z.string().regex(/^\d+$/, 'Invalid categoryId format').optional(),
  }),
});

export const createCatalogTypeSchema = z.object({
  body: z.object({
    categoryId: z.number().int().positive(),
    typeName: z.string().min(1, 'typeName is required'),
    description: z.string().optional(),
  }),
});

export const updateCatalogTypeSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    categoryId: z.number().int().positive().optional(),
    typeName: z.string().min(1, 'typeName is required'),
    description: z.string().optional(),
  }),
});

// ============================================================================
// ITEM TYPE SPECS
// ============================================================================

export const getTypeSpecsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});

export const updateTypeSpecsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    specs: z.array(
      z.object({
        componentItemId: z.number().int().positive(),
        quantity: z.number().int().positive(),
        note: z.string().optional(),
      }),
    ),
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
    typeId: z.string().regex(/^\d+$/, 'Invalid typeId format').optional(),
    status: z.nativeEnum(ItemStatus).optional(),
  }),
});

export const getCatalogItemByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});

export const createCatalogItemSchema = z.object({
  body: z.object({
    itemCode: z.string().min(1, 'itemCode is required'),
    itemName: z.string().min(1, 'itemName is required'),
    typeId: z.number().int().positive(),
    description: z.string().optional(),
    unit: z.string().min(1, 'unit is required'),
    rentalPrice: z.number().min(0, 'rentalPrice must be >= 0'),
    priceValidFrom: z.string().optional(),
    imageUrl: z.string().optional(),
    status: z.nativeEnum(ItemStatus).optional(),
  }),
});

export const updateCatalogItemSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    itemName: z.string().min(1, 'itemName is required').optional(),
    description: z.string().optional(),
    typeId: z.number().int().positive().optional(),
    unit: z.string().min(1, 'unit is required').optional(),
    rentalPrice: z.number().min(0, 'rentalPrice must be >= 0').optional(),
    priceValidFrom: z.string().optional(),
    imageUrl: z.string().optional(),
    status: z.nativeEnum(ItemStatus).optional(),
  }),
});

export const updateCatalogItemStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    status: z.nativeEnum(ItemStatus),
  }),
});
