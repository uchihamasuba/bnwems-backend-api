import { Router } from 'express';
import * as catalogController from '../controllers/catalog.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', catalogController.getCatalogItems);
router.get('/:id', catalogController.getCatalogItemById);

router.post('/', authenticate, authorizeRoles('ADMIN', 'MANAGER'), catalogController.createCatalogItem);
router.put('/:id', authenticate, authorizeRoles('ADMIN', 'MANAGER'), catalogController.updateCatalogItem);
router.put('/:id/deactivate', authenticate, authorizeRoles('ADMIN', 'MANAGER'), catalogController.deactivateCatalogItem);

export default router;
