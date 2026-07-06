import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import {
  verifyToken as protect,
  authorizeRoles as restrictTo,
} from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/revenue', protect, restrictTo(Role.ADMIN), dashboardController.getRevenueReport);
router.get('/inventory', protect, restrictTo(Role.ADMIN), dashboardController.getInventoryReport);
router.get(
  '/verification',
  protect,
  restrictTo(Role.MANAGER),
  dashboardController.getOperationalVerification,
);

export default router;
