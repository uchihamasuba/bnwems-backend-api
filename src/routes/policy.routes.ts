import { Router } from 'express';
import { PolicyController } from '../controllers/policy.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Business Policies
router.get('/business-policies', PolicyController.getBusinessPolicies);
router.put('/business-policies/:code', authorizeRoles('Admin'), PolicyController.updateBusinessPolicy);

// Wage Rules
router.get('/wage-rules', PolicyController.getWageRules);
router.post('/wage-rules', authorizeRoles('Admin'), PolicyController.createWageRule);
router.put('/wage-rules/:id', authorizeRoles('Admin'), PolicyController.updateWageRule);

export default router;