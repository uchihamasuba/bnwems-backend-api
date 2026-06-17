import { Router } from 'express';
import { fieldController } from '../controllers/field.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
router.use(verifyToken);

// PATCH /api/v1/field/progress
router.patch('/progress', requireRole('Leader Staff'), fieldController.updateProgress);

// POST /api/v1/field/change-request
router.post('/change-request', requireRole('Leader Staff'), fieldController.submitChangeRequest);

// PUT /api/v1/field/change-request/:id/approve
router.put('/change-request/:id/approve', requireRole('Manager'), fieldController.approveChangeRequest);

export default router;
