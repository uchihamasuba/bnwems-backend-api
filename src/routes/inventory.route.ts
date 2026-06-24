import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', authorizeRoles('ADMIN', 'MANAGER', 'LEADER_STAFF'), inventoryController.getInventory);
router.get('/availability', authorizeRoles('ADMIN', 'MANAGER'), inventoryController.checkAvailability);
router.post('/reserve', authorizeRoles('ADMIN', 'MANAGER'), inventoryController.reserveInventory);

export default router;
