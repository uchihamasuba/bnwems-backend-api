import { Router } from 'express';
import { WageController } from '../controllers/wage.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);
router.post('/:id/approve', authorizeRoles('admin', 'manager'), WageController.approveWageSummary);

export default router;
