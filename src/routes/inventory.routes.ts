import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);
router.get('/availability', authorizeRoles('admin', 'manager'), InventoryController.checkAvailability);

export default router;