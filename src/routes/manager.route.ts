import { Router } from 'express';
import { managerController } from '../controllers/manager.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN', 'MANAGER'));

router.get('/approvals', managerController.getPendingApprovals);

export default router;
