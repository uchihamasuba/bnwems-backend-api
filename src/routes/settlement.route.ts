import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  verifyToken as protect,
  authorizeRoles as restrictTo,
} from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import { confirmSettlementSchema } from '../validators/order.validator';

const router = Router();

router.put(
  '/:id/confirm',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(confirmSettlementSchema),
  orderController.confirmSettlement,
);

export default router;
