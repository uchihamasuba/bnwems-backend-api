import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/revenue', authorizeRoles('ADMIN'), reportController.getRevenueReport);
router.get('/inventory', authorizeRoles('ADMIN', 'MANAGER'), reportController.getInventoryReport);
router.get('/verification', authorizeRoles('ADMIN', 'MANAGER'), reportController.getVerificationReport);

export default router;
