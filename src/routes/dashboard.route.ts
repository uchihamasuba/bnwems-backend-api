import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/admin', authorizeRoles('ADMIN'), reportController.getAdminDashboard);
router.get('/manager', authorizeRoles('MANAGER'), reportController.getManagerDashboard);

export default router;
