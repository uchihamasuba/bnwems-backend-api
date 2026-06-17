import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
router.use(verifyToken);

// GET /api/v1/inventory/check
router.get('/check', requireRole('Manager', 'Administrator'), inventoryController.checkAvailability);

// POST /api/v1/operations/pick-list (mounted as /pick-list)
router.post('/pick-list', requireRole('Manager'), inventoryController.createPickList);

export default router;
