import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const checkIn = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { assignmentId, checkInTime } = req.body;
    const userId = req.user!.userId;

    if (!assignmentId || !checkInTime) {
      return next(new AppError('Required information missing.', 400));
    }

    // In a real app, verify location bounds to throw MSG-UC29-01 if needed.
    
    const newAttendance = await prisma.attendance.create({
      data: {
        assignmentId,
        userId,
        checkInTime: new Date(checkInTime),
        status: 'PENDING', // default pending until confirmed
      },
    });

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

    if (!status) {
      return next(new AppError('Status is required.', 400));
    }

    await prisma.attendance.update({
      where: { id },
      data: {
        status,
        checkOutTime: checkOutTime ? new Date(checkOutTime) : undefined,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Attendance confirmed.',
    });
  } catch (error) {
    next(error);
  }
};
