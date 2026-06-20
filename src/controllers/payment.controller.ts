import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export class PaymentController {
  static async createQrCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.createQrCode(req.params.id);
      sendSuccess(res, 'Tạo mã QR thành công', result, 'MSG-QR-01');
    } catch (error) { next(error); }
  }

  static async vnpayCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.vnpayCallback(req.body);
      // VNPay expects specific format
      res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
    } catch (error) {
      // Return VNPay standard error format
      res.status(200).json({ RspCode: '99', Message: 'Unknown Error' });
    }
  }

  static async confirmPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { decision, notes } = req.body;
      const result = await PaymentService.confirmPayment(req.params.id, decision, notes, req.user!.userId);
      sendSuccess(res, 'Đã xác nhận chứng từ thanh toán', result, 'MSG-PE-01');
    } catch (error) { next(error); }
  }

  // To preserve backwards compatibility with older routes if they exist
  static async createPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.createPayment(req.body, req.user!.userId);
      sendSuccess(res, 'Tạo thanh toán thành công', result, 'CREATE_SUCCESS', 201);
    } catch (error) { next(error); }
  }

  static async uploadEvidence(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.uploadEvidence(req.params.id, req.body.evidence_file_ids, req.user!.userId);
      sendSuccess(res, 'Đã tải lên chứng từ thanh toán', result, 'MSG-PE-03');
    } catch (error) { next(error); }
  }

  static async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.getPaymentsByOrder(req.params.orderId);
      sendSuccess(res, 'Lấy danh sách thanh toán thành công', result);
    } catch (error) { next(error); }
  }
}