import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class AttendanceService {
  public async checkIn(data: any, actionUserId: string) {
    const { planId, checkInEvidenceId, checkInAt } = data;

    // Verify plan
    const plan = await prisma.schedulePlan.findUnique({ where: { planId: BigInt(planId) } });
    if (!plan) throw new AppError('Không tìm thấy phân công.', 404);
    if (plan.assignedTo !== BigInt(actionUserId)) {
      throw new AppError('Không thể chấm công cho người khác.', 403);
    }

    return await prisma.attendance.create({
      data: {
        planId: BigInt(planId),
        userId: BigInt(actionUserId),
        checkInAt: new Date(checkInAt),
        checkInEvidenceId: checkInEvidenceId ? BigInt(checkInEvidenceId) : null,
      },
    });
  }

  public async checkOut(attendanceId: string, data: any, actionUserId: string) {
    const { checkOutAt, note } = data;

    const attendance = await prisma.attendance.findUnique({
      where: { attendanceId: BigInt(attendanceId) },
    });
    if (!attendance) throw new AppError('Không tìm thấy bản ghi chấm công.', 404);
    if (attendance.userId !== BigInt(actionUserId)) {
      throw new AppError('Không thể chấm công cho người khác.', 403);
    }

    return await prisma.attendance.update({
      where: { attendanceId: BigInt(attendanceId) },
      data: {
        checkOutAt: new Date(checkOutAt),
        note,
      },
    });
  }
}

export const attendanceService = new AttendanceService();
