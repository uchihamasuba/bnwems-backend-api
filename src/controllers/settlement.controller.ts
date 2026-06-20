import { Request, Response, NextFunction } from 'express';
import { SettlementService } from '../services/settlement.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export class SettlementController {
  static async approveSettlement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await SettlementService.approveSettlement(req.params.id, req.user!.userId);
      sendSuccess(res, 'Đã xác nhận quyết toán', result, 'MSG-STA-01');
    } catch (error) { next(error); }
  }

  static async submitSettlement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await SettlementService.submitSettlement(req.params.id, req.user!.userId);
      sendSuccess(res, 'Đã nộp quyết toán', result, 'MSG-SA-01');
    } catch (error) { next(error); }
  }
}