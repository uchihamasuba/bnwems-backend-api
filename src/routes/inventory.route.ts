import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  verifyToken as protect,
  authorizeRoles as restrictTo,
} from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import {
  getInventorySchema,
  adjustInventorySchema,
  getInventoryMovementsSchema,
  createReturnReportSchema,
  confirmReturnReportSchema,
} from '../validators/inventory.validator';

const router = Router();

router.get('/', validate(getInventorySchema), inventoryController.getInventory);

router.post(
  '/adjust',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(adjustInventorySchema),
  inventoryController.adjustInventory,
);

router.get(
  '/movements',
  validate(getInventoryMovementsSchema),
  inventoryController.getInventoryMovements,
);

router.post(
  '/return-reports',
  protect,
  validate(createReturnReportSchema),
  inventoryController.createReturnReport,
);

router.put(
  '/return-reports/:id/confirm',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(confirmReturnReportSchema),
  inventoryController.confirmReturnReport,
);

export default router;
