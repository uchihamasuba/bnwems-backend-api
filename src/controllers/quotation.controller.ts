import { Request, Response, NextFunction } from 'express';
import { QuotationService } from '../services/quotation.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export class QuotationController {
  static async getQuotationsByOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const quotations = await QuotationService.getQuotationsByOrder(req.params.id);
      sendSuccess(res, 'Lấy danh sách báo giá thành công', quotations);
    } catch (error) { next(error); }
  }

  static async getQuotationById(req: Request, res: Response, next: NextFunction) {
    try {
      const quotation = await QuotationService.getQuotationById(req.params.id);
      sendSuccess(res, 'Lấy chi tiết báo giá thành công', quotation);
    } catch (error) { next(error); }
  }

  static async createQuotation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const quotation = await QuotationService.createQuotation(req.params.id, req.body, req.user!.userId);
      sendSuccess(res, 'Tạo báo giá thành công', quotation, 'MSG-QT-01', 201);
    } catch (error) { next(error); }
  }

  static async updateQuotation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const quotation = await QuotationService.updateQuotation(req.params.id, req.body, req.user!.userId);
      sendSuccess(res, 'Cập nhật báo giá thành công (tạo version mới)', quotation, 'MSG-UQ-01');
    } catch (error) { next(error); }
  }

  static async approveQuotation(req: Request, res: Response, next: NextFunction) {
    try {
      const quotation = await QuotationService.approveQuotation(req.params.id);
      sendSuccess(res, 'Xác nhận báo giá thành công', quotation, 'MSG-CQ-01');
    } catch (error) { next(error); }
  }
}