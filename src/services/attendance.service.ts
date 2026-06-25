import { prisma } from '../config/database';

class AttendanceService {
  public async checkIn(assignmentId: string, checkInTime: string, userId: string) {
    // In a real app, verify location bounds to throw MSG-UC29-01 if needed.
    
    const newAttendance = await prisma.attendance.create({
      data: {
        assignmentId: BigInt(assignmentId),
        checkIn: new Date(checkInTime),
        completionStatus: 'pending',
      },
    });

    return newAttendance;
  }

  public async confirmAttendance(id: string, status: string, actionUserId: string, checkOutTime?: string) {
    await prisma.attendance.update({
      where: { attendanceId: BigInt(id) },
      data: {
        completionStatus: status.toLowerCase(),
        checkOut: checkOutTime ? new Date(checkOutTime) : undefined,
        confirmedBy: BigInt(actionUserId),
        confirmedAt: new Date()
      },
    });
  }
}

export const attendanceService = new AttendanceService();
