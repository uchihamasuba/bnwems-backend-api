import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  verifyToken as protect,
  authorizeRoles as restrictTo,
} from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import { updateDepositStatusSchema } from '../validators/order.validator';

const router = Router();

router.put(
  '/:id',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(updateDepositStatusSchema),
  orderController.updateDepositStatus,
);

export default router;
