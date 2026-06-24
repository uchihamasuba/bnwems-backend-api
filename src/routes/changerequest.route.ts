import { Router } from 'express';
import * as changerequestController from '../controllers/changerequest.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(authorizeRoles('ADMIN', 'MANAGER'));

// Mounted on /api/v1/orders/:orderId/change-requests or /api/v1/change-requests
router.post('/', changerequestController.createChangeRequest);
router.put('/:id/approve', changerequestController.approveChangeRequest);

export default router;
