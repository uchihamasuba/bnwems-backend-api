import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { attendanceService } from '../services/attendance.service';

export const checkIn = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { assignmentId, checkInTime } = req.body;
    const userId = req.user!.userId;

    await attendanceService.checkIn(assignmentId, checkInTime, userId);

    res.status(200).json({
      success: true,
      message: 'Check-in successful.',
    });
  } catch (error) {
    next(error);
  }
};

export const confirmAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, checkOutTime } = req.body;

    await attendanceService.confirmAttendance(id, status, checkOutTime);

    res.status(200).json({
      success: true,
      message: 'Attendance confirmed.',
    });
  } catch (error) {
    next(error);
  }
};
