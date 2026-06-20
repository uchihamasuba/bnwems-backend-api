import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export class AttendanceService {
  static async checkIn(assignmentId: string, sessionType: string, userId: string) {
    return prisma.attendance.create({
      data: {
        assignmentId: BigInt(assignmentId),
        userId: BigInt(userId),
        workDate: new Date(),
        sessionType,
        checkInTime: new Date()
      }
    });
  }

  static async checkOut(attendanceId: string) {
    return prisma.attendance.update({
      where: { id: BigInt(attendanceId) },
      data: { checkOutTime: new Date() }
    });
  }

  static async verifyAttendance(attendanceId: string) {
    const updated = await prisma.attendance.update({
      where: { id: BigInt(attendanceId) },
      data: { status: 'verified' }
    });
    return {
      id: Number(updated.id),
      status: updated.status
    };
  }
}