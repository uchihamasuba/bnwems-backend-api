import { Router } from 'express';
import { AssignmentController } from '../controllers/assignment.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);
router.get('/:id', authorizeRoles('admin', 'manager', 'leader_staff', 'technical_staff'), AssignmentController.getAssignmentById);

export default router;
