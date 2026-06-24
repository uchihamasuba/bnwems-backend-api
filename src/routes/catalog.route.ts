import { Router } from 'express';
import * as catalogController from '../controllers/catalog.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { getCatalogItemsSchema, getCatalogItemByIdSchema, createCatalogItemSchema, updateCatalogItemSchema, deactivateCatalogItemSchema } from '../validators/catalog.validator';

const router = Router();

router.get('/', validate(getCatalogItemsSchema), catalogController.getCatalogItems);
router.get('/:id', validate(getCatalogItemByIdSchema), catalogController.getCatalogItemById);

router.post('/', authenticate, authorizeRoles('ADMIN', 'MANAGER'), validate(createCatalogItemSchema), catalogController.createCatalogItem);
router.put('/:id', authenticate, authorizeRoles('ADMIN', 'MANAGER'), validate(updateCatalogItemSchema), catalogController.updateCatalogItem);
router.put('/:id/deactivate', authenticate, authorizeRoles('ADMIN', 'MANAGER'), validate(deactivateCatalogItemSchema), catalogController.deactivateCatalogItem);

export default router;
