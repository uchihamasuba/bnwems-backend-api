import { Router } from 'express';
import { policyController } from '../controllers/policy.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
router.use(verifyToken, requireRole('Administrator'));

// POST /api/v1/admin/policies
router.post('/', policyController.createPolicy);

// GET /api/v1/admin/policies
router.get('/', policyController.getPolicies);

export default router;
