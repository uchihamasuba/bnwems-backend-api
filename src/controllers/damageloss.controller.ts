import { Request, Response, NextFunction } from 'express';
import { DamageLossService } from '../services/damageloss.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export class DamageLossController {
  static async confirmDamageLoss(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { decision, notes } = req.body;
      const result = await DamageLossService.confirmDamageLoss(req.params.id, decision, notes, req.user!.userId);
      sendSuccess(res, 'Đã xác nhận biên bản hư hỏng/mất mát', result, 'MSG-DL-01');
    } catch (error) { next(error); }
  }
}
