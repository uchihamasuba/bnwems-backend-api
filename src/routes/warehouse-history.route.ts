import { Router } from 'express';
import * as warehouseHistoryController from '../controllers/warehouse-history.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN', 'MANAGER', 'LEADER_STAFF'));

router.get('/', warehouseHistoryController.getWarehouseHistories);

export default router;
