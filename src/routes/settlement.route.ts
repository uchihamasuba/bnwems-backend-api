import { Router } from 'express';
import * as settlementController from '../controllers/settlement.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticate);

// Mounted on /api/v1/orders/:orderId/settlement
router.post('/', authorizeRoles('LEADER_STAFF', 'MANAGER'), settlementController.recordSettlement);

// Mounted on /api/v1/settlements
router.put('/:id/confirm', authorizeRoles('ADMIN', 'MANAGER'), settlementController.confirmSettlement);

export default router;
