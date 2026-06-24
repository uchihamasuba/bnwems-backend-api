import { Router } from 'express';
import * as policyController from '../controllers/policy.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { getPoliciesSchema, createPolicySchema, updatePolicySchema } from '../validators/policy.validator';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

router.get('/', validate(getPoliciesSchema), policyController.getPolicies);
router.post('/', validate(createPolicySchema), policyController.createPolicy);
router.put('/:id', validate(updatePolicySchema), policyController.updatePolicy);

export default router;
