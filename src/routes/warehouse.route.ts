import { Router } from 'express';
import * as warehouseController from '../controllers/warehouse.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/checkout', authorizeRoles('ADMIN', 'MANAGER', 'LEADER_STAFF'), warehouseController.checkoutWarehouse);
router.post('/return', authorizeRoles('ADMIN', 'MANAGER', 'LEADER_STAFF'), warehouseController.returnWarehouse);

export default router;
