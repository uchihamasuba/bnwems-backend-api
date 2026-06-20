import { Router } from 'express';
import { CatalogController } from '../controllers/catalog.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Catalog Items
router.get('/catalog-items', CatalogController.getCatalogItems);
router.get('/catalog-items/:id', CatalogController.getCatalogItemById);
router.post('/catalog-items', authorizeRoles('Admin'), CatalogController.createCatalogItem);
router.put('/catalog-items/:id', authorizeRoles('Admin'), CatalogController.updateCatalogItem);
router.patch('/catalog-items/:id/status', authorizeRoles('Admin'), CatalogController.updateCatalogItemStatus);

// Item Prices
router.get('/catalog-items/:id/prices', CatalogController.getItemPriceHistory);
router.post('/catalog-items/:id/prices', authorizeRoles('Admin'), CatalogController.setItemPrice);

// Catalog Categories
router.get('/catalog-categories', CatalogController.getCatalogCategories);
router.post('/catalog-categories', authorizeRoles('Admin'), CatalogController.createCatalogCategory);
router.put('/catalog-categories/:id', authorizeRoles('Admin'), CatalogController.updateCatalogCategory);

export default router;