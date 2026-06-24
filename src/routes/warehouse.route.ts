import { Router } from 'express';
import * as warehouseController from '../controllers/warehouse.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { getWarehouseHistoriesSchema, checkoutWarehouseSchema, returnWarehouseSchema } from '../validators/warehouse.validator';

const router = Router();

router.use(authenticate);

router.post('/checkout', authorizeRoles('ADMIN', 'MANAGER', 'LEADER_STAFF'), validate(checkoutWarehouseSchema), warehouseController.checkoutWarehouse);
router.post('/return', authorizeRoles('ADMIN', 'MANAGER', 'LEADER_STAFF'), validate(returnWarehouseSchema), warehouseController.returnWarehouse);

export default router;
