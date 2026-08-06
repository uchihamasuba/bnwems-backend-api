import { Request, Response, NextFunction } from 'express';
import { attendanceService } from '../services/attendance.service';

export const attendanceController = {
  async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.userId;
      await attendanceService.checkIn(req.body, userId);

      res.status(200).json({
        success: true,
        code: 'MSG-PO-04',
        message: 'Chấm công vào ca thành công.',
      });
    } catch (error) {
      next(error);
    }
  },

  async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.userId;
      await attendanceService.checkOut(req.params.id, req.body, userId);

      res.status(200).json({
        success: true,
        code: 'MSG-PO-05',
        message: 'Chấm công ra ca thành công.',
      });
    } catch (error) {
      next(error);
    }
  },
};
