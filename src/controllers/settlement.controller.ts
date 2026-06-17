import { Request, Response, NextFunction } from 'express';
import { settlementService } from '../services/settlement.service';

export const settlementController = {
  async createSettlement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await settlementService.createSettlement(req.body);
      res.status(201).json({ success: true, statusCode: 201, message: 'Thông tin quyết toán đã được ghi nhận thành công (MSG-ST02).' });
    } catch (err) { next(err); }
  },

  async submitForApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await settlementService.submitForApproval(Number(req.params.id));
      res.status(200).json({ success: true, statusCode: 200, message: 'Hồ sơ quyết toán đã được trình duyệt thành công (MSG-SA02).' });
    } catch (err) { next(err); }
  },
};
