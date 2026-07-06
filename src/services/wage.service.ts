import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class WageService {
  public async getWagesSummary(
    page: number,
    limit: number,
    periodParam?: string,
    userId?: string,
    status?: string,
  ) {
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (userId) whereClause.userId = BigInt(userId);
    if (status) whereClause.status = status;

    const [wages, totalCount] = await Promise.all([
      prisma.wageRecord.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.wageRecord.count({ where: whereClause }),
    ]);

    return { wages, totalCount };
  }

  public async confirmWage(id: string, status: string, actionUserId: string) {
    if (status.toUpperCase() !== 'CONFIRMED' && status !== 'Đã xác nhận') {
      throw new AppError('Trạng thái phải là CONFIRMED hoặc Đã xác nhận.', 400);
    }

    const wageRecord = await prisma.wageRecord.findUnique({ where: { wageId: BigInt(id) } });
    if (!wageRecord) throw new AppError('Không tìm thấy bản ghi lương.', 404);

    await prisma.wageRecord.update({
      where: { wageId: BigInt(id) },
      data: {
        status: status as any,
        confirmedBy: BigInt(actionUserId),
      },
    });
  }
}

export const wageService = new WageService();
