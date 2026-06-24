import { prisma } from '../config/database';

class AttendanceService {
  public async checkIn(assignmentId: string, checkInTime: string, userId: string) {
    // In a real app, verify location bounds to throw MSG-UC29-01 if needed.
    
    const newAttendance = await prisma.attendance.create({
      data: {
        assignmentId,
        userId,
        checkInTime: new Date(checkInTime),
        status: 'PENDING',
      },
    });

    return newAttendance;
  }

  public async confirmAttendance(id: string, status: string, checkOutTime?: string) {
    await prisma.attendance.update({
      where: { id },
      data: {
        status: status as any,
        checkOutTime: checkOutTime ? new Date(checkOutTime) : undefined,
      },
    });
  }
}

export const attendanceService = new AttendanceService();
