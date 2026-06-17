import { Request, Response, NextFunction } from 'express';
import { attendanceService } from '../services/attendance.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const attendanceController = {
  async recordAttendance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await attendanceService.recordAttendance({
        ...req.body,
        recordedByLeaderId: req.user!.userId,
      });
      res.status(201).json({ success: true, statusCode: 201, message: 'Điểm danh ca làm việc thực địa thành công (MSG-RA04).' });
    } catch (err) { next(err); }
  },
};
