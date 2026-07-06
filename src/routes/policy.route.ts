import { Router } from 'express';
import { policyController } from '../controllers/policy.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  verifyToken as protect,
  authorizeRoles as restrictTo,
} from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import {
  getPoliciesSchema,
  createPolicySchema,
  updatePolicySchema,
} from '../validators/policy.validator';

const router = Router();

router.get(
  '/',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(getPoliciesSchema),
  policyController.getPolicies,
);

router.post(
  '/',
  protect,
  restrictTo(Role.ADMIN),
  validate(createPolicySchema),
  policyController.createPolicy,
);

router.put(
  '/:id',
  protect,
  restrictTo(Role.ADMIN),
  validate(updatePolicySchema),
  policyController.updatePolicy,
);

export default router;
