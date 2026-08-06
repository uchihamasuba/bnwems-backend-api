import { Router } from 'express';
import * as wageController from '../controllers/wage.controller';
import {
  verifyToken as protect,
  authorizeRoles as restrictTo,
} from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(protect);
router.use(restrictTo(Role.ADMIN, Role.MANAGER));

import { validate } from '../middlewares/validate.middleware';
import { getWagesSummarySchema, confirmWageSchema } from '../validators/wage.validator';

router.get('/', validate(getWagesSummarySchema), wageController.getWagesSummary);
router.post('/:id/confirm', validate(confirmWageSchema), wageController.confirmWage);

export default router;
