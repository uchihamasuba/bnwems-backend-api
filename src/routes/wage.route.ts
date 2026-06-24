import { Router } from 'express';
import * as wageController from '../controllers/wage.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN', 'MANAGER'));

import { validate } from '../middlewares/validate.middleware';
import { getWagesSummarySchema, confirmWageSchema } from '../validators/wage.validator';

router.get('/summary', validate(getWagesSummarySchema), wageController.getWagesSummary);
router.post('/summary/:id/confirm', validate(confirmWageSchema), wageController.confirmWage);

export default router;
