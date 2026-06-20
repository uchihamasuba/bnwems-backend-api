import { Request, Response, NextFunction } from 'express';
import { HandoverService } from '../services/handover.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export class HandoverController {
  static async confirmHandover(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { decision, notes } = req.body;
      const result = await HandoverService.confirmHandover(req.params.id, decision || 'confirmed', notes || '', req.user!.userId);
      sendSuccess(res, 'Đã xác nhận biên bản bàn giao', result, 'MSG-HO-03');
    } catch (error) { next(error); }
  }

  static async createWarehouseReceipt(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await HandoverService.createWarehouseReceipt(req.params.id, req.user!.userId);
      sendSuccess(res, 'Đã ghi nhận hoàn trả kho nội bộ', result, 'MSG-IER-01');
    } catch (error) { next(error); }
  }

  static async updateHandoverItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await HandoverService.updateHandoverItem(req.params.id, req.params.itemId, req.body, req.user!.userId);
      sendSuccess(res, 'Đã phân loại thiết bị', result, 'MSG-CL-01');
    } catch (error) { next(error); }
  }

  static async submitHandover(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await HandoverService.submitHandover(req.params.id, req.user!.userId);
      sendSuccess(res, 'Đã nộp báo cáo hoàn trả kho', result, 'MSG-IR-01');
    } catch (error) { next(error); }
  }
}
