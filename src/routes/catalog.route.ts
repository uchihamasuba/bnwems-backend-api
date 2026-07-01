import { Router } from 'express';
import * as catalogController from '../controllers/catalog.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  getCatalogCategoriesSchema,
  getCatalogCategoryByIdSchema,
  createCatalogCategorySchema,
  updateCatalogCategorySchema,
  updateCatalogCategoryStatusSchema,
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
router.get('/catalog-categories', validate(getCatalogCategoriesSchema), catalogController.getCatalogCategories);
router.get('/catalog-categories/:id', validate(getCatalogCategoryByIdSchema), catalogController.getCatalogCategoryById);

router.post('/catalog-categories', authenticate, authorizeRoles('ADMIN', 'MANAGER'), validate(createCatalogCategorySchema), catalogController.createCatalogCategory);
router.put('/catalog-categories/:id', authenticate, authorizeRoles('ADMIN', 'MANAGER'), validate(updateCatalogCategorySchema), catalogController.updateCatalogCategory);
router.put('/catalog-categories/:id/deactivate', authenticate, authorizeRoles('ADMIN', 'MANAGER'), validate(updateCatalogCategoryStatusSchema), catalogController.updateCatalogCategoryStatus);

// ============================================================================
// CATALOG ITEM
// ============================================================================
router.get('/catalog-items', validate(getCatalogItemsSchema), catalogController.getCatalogItems);
router.get('/catalog-items/:id', validate(getCatalogItemByIdSchema), catalogController.getCatalogItemById);

router.post('/catalog-items', authenticate, authorizeRoles('ADMIN', 'MANAGER'), validate(createCatalogItemSchema), catalogController.createCatalogItem);
router.put('/catalog-items/:id', authenticate, authorizeRoles('ADMIN', 'MANAGER'), validate(updateCatalogItemSchema), catalogController.updateCatalogItem);
router.put('/catalog-items/:id/deactivate', authenticate, authorizeRoles('ADMIN', 'MANAGER'), validate(updateCatalogItemStatusSchema), catalogController.updateCatalogItemStatus);

export default router;
