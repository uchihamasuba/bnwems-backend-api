import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export class AttendanceController {
  static async checkIn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { assignmentId, sessionType } = req.body;
      const att = await AttendanceService.checkIn(assignmentId, sessionType, req.user!.userId);
      sendSuccess(res, 'Checked in successfully', att, 'CREATE_SUCCESS', 201);
    } catch (error) { next(error); }
  }

  static async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const att = await AttendanceService.checkOut(req.params.id);
      sendSuccess(res, 'Checked out successfully', att);
    } catch (error) { next(error); }
  }

  static async verifyAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const att = await AttendanceService.verifyAttendance(req.params.id);
      sendSuccess(res, 'Đã xác nhận ca làm việc', att, 'MSG-CW-01');
    } catch (error) { next(error); }
  }
}