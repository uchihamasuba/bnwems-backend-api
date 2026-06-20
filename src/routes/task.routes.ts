import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);
router.patch('/:id/progress', authorizeRoles('admin', 'manager', 'leader_staff', 'technical_staff'), TaskController.updateTaskProgress);

export default router;
