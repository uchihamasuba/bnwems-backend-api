import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const paymentController = {
  async generateQr(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await paymentService.generateQr(req.body);
      res.status(200).json({ success: true, statusCode: 200, data });
    } catch (err) { next(err); }
  },

  async submitEvidence(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await paymentService.submitEvidence({ ...req.body, submittedByUserId: req.user!.userId });
      res.status(201).json({ success: true, statusCode: 201, message: 'Minh chứng thanh toán đã được gửi thành công đến Manager để xác nhận (MSG-PE03).' });
    } catch (err) { next(err); }
  },
};
