import { Router } from 'express';
import { DamageLossController } from '../controllers/damageloss.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);
router.post('/:id/confirm', authorizeRoles('admin', 'manager'), DamageLossController.confirmDamageLoss);

export default router;
