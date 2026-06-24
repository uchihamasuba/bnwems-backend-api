import { Router } from 'express';
import * as wageController from '../controllers/wage.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN', 'MANAGER'));

router.get('/summary', wageController.getWagesSummary);
router.post('/summary/:id/confirm', wageController.confirmWage);

export default router;
