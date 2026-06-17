import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { settlementController } from '../controllers/settlement.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';

const paymentRouter = Router();
paymentRouter.use(verifyToken);

// POST /api/v1/payments/generate-qr
paymentRouter.post('/generate-qr', requireRole('Manager'), paymentController.generateQr);

// POST /api/v1/payments/evidence
paymentRouter.post('/evidence', requireRole('Manager', 'Leader Staff'), paymentController.submitEvidence);

const settlementRouter = Router();
settlementRouter.use(verifyToken, requireRole('Manager', 'Leader Staff'));

// POST /api/v1/settlements
settlementRouter.post('/', settlementController.createSettlement);

// POST /api/v1/settlements/:id/submit-approval
settlementRouter.post('/:id/submit-approval', settlementController.submitForApproval);

// Also add confirm quotation route here
const quotationRouter = Router();
quotationRouter.use(verifyToken, requireRole('Manager'));
quotationRouter.post('/:id/confirm', async (req, res, next) => {
  const { orderService } = await import('../services/order.service');
  try {
    await orderService.confirmQuotation(Number(req.params.id));
    res.status(200).json({ success: true, statusCode: 200, message: 'Xác nhận báo giá thành công. Trạng thái đơn hàng chuyển sang Chờ Đặt Cọc.' });
  } catch (err) { next(err); }
});

export { paymentRouter, settlementRouter, quotationRouter };
