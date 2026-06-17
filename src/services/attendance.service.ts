import prisma from '../config/database';

export const attendanceService = {
  async recordAttendance(payload: {
    workSessionId: number;
    attendedStaffIds: number[];
    recordedByLeaderId: number;
  }) {
    const workSession = await prisma.workSession.findUnique({
      where: { id: payload.workSessionId },
    });

    if (!workSession) {
      const err: Error & { statusCode?: number } = new Error(
        'Bạn không được phân công phụ trách quản lý tác vụ này (MSG-RA01).'
      );
      err.statusCode = 400;
      throw err;
    }

    // Check for duplicate attendance records
    const existing = await prisma.attendanceRecord.findFirst({
      where: {
        workSessionId: payload.workSessionId,
        status: { not: 'REJECTED' },
      },
    });

    if (existing) {
      const err: Error & { statusCode?: number } = new Error(
        'Dữ liệu chấm công ca làm việc này đã được ghi nhận trước đó (MSG-RA02).'
      );
      err.statusCode = 409;
      throw err;
    }

    const records = await prisma.$transaction(
      payload.attendedStaffIds.map((staffId) =>
        prisma.attendanceRecord.create({
          data: {
            workSessionId: payload.workSessionId,
            staffId,
            checkInTime: new Date(),
            status: 'PENDING_CONFIRMATION',
          },
        })
      )
    );

    return records;
  },
};
