import { Router } from 'express';
import { HandoverController } from '../controllers/handover.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);
router.post('/:id/confirm', authorizeRoles('admin', 'manager'), HandoverController.confirmHandover);
router.post('/:id/warehouse-receipt', authorizeRoles('admin', 'manager', 'leader_staff', 'warehouse_staff'), HandoverController.createWarehouseReceipt);
router.patch('/:id/items/:itemId', authorizeRoles('admin', 'manager', 'leader_staff'), HandoverController.updateHandoverItem);
router.post('/:id/submit', authorizeRoles('admin', 'manager', 'leader_staff'), HandoverController.submitHandover);

export default router;
