import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

import { validate } from '../middlewares/validate.middleware';
import { getRevenueReportSchema, getInventoryReportSchema, getVerificationReportSchema } from '../validators/report.validator';

router.get('/revenue', authorizeRoles('ADMIN'), validate(getRevenueReportSchema), reportController.getRevenueReport);
router.get('/inventory', authorizeRoles('ADMIN', 'MANAGER'), validate(getInventoryReportSchema), reportController.getInventoryReport);
router.get('/verification', authorizeRoles('ADMIN', 'MANAGER'), validate(getVerificationReportSchema), reportController.getVerificationReport);

export default router;
