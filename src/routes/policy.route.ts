import { Router } from 'express';
import * as policyController from '../controllers/policy.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

router.get('/', policyController.getPolicies);
router.post('/', policyController.createPolicy);
router.put('/:id', policyController.updatePolicy);

export default router;
