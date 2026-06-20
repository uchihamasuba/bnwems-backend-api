import { Router } from 'express';
import { ChangeRequestController } from '../controllers/changerequest.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);
router.post('/:id/review', authorizeRoles('admin', 'manager'), ChangeRequestController.reviewChangeRequest);

export default router;
