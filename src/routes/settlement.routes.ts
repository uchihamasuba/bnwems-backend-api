import { Router } from 'express';
import { SettlementController } from '../controllers/settlement.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);
router.post('/:id/approve', authorizeRoles('admin', 'manager'), SettlementController.approveSettlement);
router.post('/:id/submit', authorizeRoles('admin', 'manager', 'leader_staff'), SettlementController.submitSettlement);

export default router;