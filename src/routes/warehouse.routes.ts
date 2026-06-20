import { Router } from 'express';
import { WarehouseController } from '../controllers/warehouse.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/', authorizeRoles('admin', 'manager'), WarehouseController.getWarehouses);
router.put('/:id', authorizeRoles('admin'), WarehouseController.updateWarehouse);
router.get('/:id/inventory', authorizeRoles('admin', 'manager'), WarehouseController.getWarehouseInventory);

export default router;
