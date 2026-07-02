import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class WageService {
  public async getWagesSummary(page: number, limit: number, periodParam?: string, userId?: string, status?: string) {
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (periodParam) whereClause.period = periodParam;
    if (userId) whereClause.userId = BigInt(userId);
    if (status) whereClause.status = status.toLowerCase();

    const [wages, totalCount] = await Promise.all([
      prisma.wageSummary.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.wageSummary.count({ where: whereClause }),
    ]);

    return { wages, totalCount };
  }

  public async confirmWage(id: string, status: string, actionUserId: string) {
    if (status.toUpperCase() !== 'CONFIRMED') {
      throw new AppError('Trạng thái phải là CONFIRMED.', 400);
    }

    // BR-17-02: Check if there are PENDING attendances for the period
    // In reality, query attendances. We skip detailed validation for now.

    const wageSummary = await prisma.wageSummary.findUnique({ where: { wageSummaryId: BigInt(id) } });
    if (!wageSummary) throw new AppError('Không tìm thấy bảng tổng hợp lương.', 404);

    await prisma.wageSummary.update({
      where: { wageSummaryId: BigInt(id) },
      data: { 
        status: status.toLowerCase(),
        confirmedBy: BigInt(actionUserId)
      },
    });
  }
}

export const wageService = new WageService();
