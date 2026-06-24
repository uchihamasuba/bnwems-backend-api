import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticate);

// Mounted on /api/v1/orders/:orderId/payments or /api/v1/payments
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), paymentController.getPaymentsByOrder);
router.post('/request', authorizeRoles('ADMIN', 'MANAGER'), paymentController.requestPayment);

// Standalone endpoint: /api/v1/payments/:id/confirm
router.put('/:id/confirm', authorizeRoles('ADMIN', 'MANAGER'), paymentController.confirmPayment);

export default router;
