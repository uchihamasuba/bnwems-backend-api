import { Router } from 'express';
import { catalogController } from '../controllers/catalog.controller';
import { validate as validateRequest } from '../middlewares/validate.middleware';
import {
  verifyToken as protect,
  authorizeRoles as restrictTo,
} from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import {
  getCatalogCategoriesSchema,
  createCatalogCategorySchema,
  updateCatalogCategorySchema,
  getCatalogCategoryByIdSchema,
  updateCatalogCategoryStatusSchema,
  getCatalogTypesSchema,
  createCatalogTypeSchema,
  updateCatalogTypeSchema,
  getTypeSpecsSchema,
  updateTypeSpecsSchema,
  getCatalogItemsSchema,
  getCatalogItemByIdSchema,
  createCatalogItemSchema,
  updateCatalogItemSchema,
  updateCatalogItemStatusSchema,
} from '../validators/catalog.validator';

const router = Router();

// ============================================================================
// CATALOG CATEGORY
// ============================================================================

router.get(
  '/categories',
  validateRequest(getCatalogCategoriesSchema),
  catalogController.getCatalogCategories,
);

router.post(
  '/categories',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validateRequest(createCatalogCategorySchema),
  catalogController.createCatalogCategory,
);

router.put(
  '/categories/:id',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validateRequest(updateCatalogCategorySchema),
  catalogController.updateCatalogCategory,
);

router.get(
  '/categories/:id',
  validateRequest(getCatalogCategoryByIdSchema),
  catalogController.getCatalogCategory,
);

router.patch(
  '/categories/:id/status',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validateRequest(updateCatalogCategoryStatusSchema),
  catalogController.updateCatalogCategoryStatus,
);

// ============================================================================
// CATALOG TYPE
// ============================================================================

router.get('/types', validateRequest(getCatalogTypesSchema), catalogController.getCatalogTypes);

router.post(
  '/types',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validateRequest(createCatalogTypeSchema),
  catalogController.createCatalogType,
);

router.put(
  '/types/:id',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validateRequest(updateCatalogTypeSchema),
  catalogController.updateCatalogType,
);

// ============================================================================
// ITEM TYPE SPECS
// ============================================================================

router.get('/types/:id/specs', validateRequest(getTypeSpecsSchema), catalogController.getTypeSpecs);

router.post(
  '/types/:id/specs',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validateRequest(updateTypeSpecsSchema),
  catalogController.updateTypeSpecs,
);

// ============================================================================
// CATALOG ITEM
// ============================================================================

router.get('/items', validateRequest(getCatalogItemsSchema), catalogController.getCatalogItems);

router.get(
  '/items/:id',
  validateRequest(getCatalogItemByIdSchema),
  catalogController.getCatalogItemById,
);

router.post(
  '/items',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validateRequest(createCatalogItemSchema),
  catalogController.createCatalogItem,
);

router.put(
  '/items/:id',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validateRequest(updateCatalogItemSchema),
  catalogController.updateCatalogItem,
);

router.patch(
  '/items/:id/status',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validateRequest(updateCatalogItemStatusSchema),
  catalogController.updateCatalogItemStatus,
);

export default router;
