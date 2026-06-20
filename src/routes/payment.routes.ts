import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// VNPay callback does not require our auth token
router.post('/vnpay/callback', PaymentController.vnpayCallback);

router.use(verifyToken);
router.post('/:id/qr-code', authorizeRoles('admin', 'manager', 'accountant'), PaymentController.createQrCode);
router.post('/:id/confirm', authorizeRoles('admin', 'manager', 'accountant'), PaymentController.confirmPayment);
router.post('/:id/evidence', authorizeRoles('admin', 'manager', 'accountant', 'leader_staff'), PaymentController.uploadEvidence);

export default router;