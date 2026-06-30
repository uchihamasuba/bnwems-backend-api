import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

import { validate } from '../middlewares/validate.middleware';
import { getInventorySchema, checkAvailabilitySchema, reserveInventorySchema, getInventoryReportsSchema, checkoutInventorySchema, returnInventorySchema } from '../validators/inventory.validator';

router.get('/', authorizeRoles('ADMIN', 'MANAGER', 'LEADER_STAFF'), validate(getInventorySchema), inventoryController.getInventory);
router.get('/availability', authorizeRoles('ADMIN', 'MANAGER'), validate(checkAvailabilitySchema), inventoryController.checkAvailability);
router.post('/reserve', authorizeRoles('ADMIN', 'MANAGER'), validate(reserveInventorySchema), inventoryController.reserveInventory);

router.get('/inventory-reports', authorizeRoles('ADMIN', 'MANAGER'), validate(getInventoryReportsSchema), inventoryController.getInventoryReports);
router.post('/checkout', authorizeRoles('ADMIN', 'MANAGER'), validate(checkoutInventorySchema), inventoryController.checkoutInventory);
router.post('/return', authorizeRoles('ADMIN', 'MANAGER'), validate(returnInventorySchema), inventoryController.returnInventory);

export default router;
