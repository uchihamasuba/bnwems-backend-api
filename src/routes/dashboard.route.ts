import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import {
  verifyToken as protect,
  authorizeRoles as restrictTo,
} from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/admin', protect, restrictTo(Role.ADMIN), dashboardController.getAdminDashboard);
router.get('/manager', protect, restrictTo(Role.MANAGER), dashboardController.getManagerDashboard);

export default router;
