import { Request, Response, NextFunction } from 'express';
import { WageService } from '../services/wage.service';
import { sendSuccess } from '../utils/response';

export class WageController {
  static async approveWageSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WageService.approveWageSummary(req.params.id);
      sendSuccess(res, 'Đã duyệt dữ liệu lương', result, 'MSG-WD-01');
    } catch (error) { next(error); }
  }
}
