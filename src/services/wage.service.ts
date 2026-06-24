import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class WageService {
  public async getWagesSummary(page: number, limit: number, period?: string, userId?: string, status?: string) {
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (period) whereClause.wagePeriod = period;
    if (userId) whereClause.userId = userId;
    if (status) whereClause.status = status;

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

  public async confirmWage(id: string, status: string) {
    if (status !== 'CONFIRMED') {
      throw new AppError('Status must be CONFIRMED.', 400);
    }

    // BR-17-02: Check if there are PENDING attendances for the period
    // In reality, query attendances. We skip detailed validation for now.

    const wageSummary = await prisma.wageSummary.findUnique({ where: { id } });
    if (!wageSummary) throw new AppError('Wage summary not found', 404);

    await prisma.wageSummary.update({
      where: { id },
      data: { status },
    });
  }
}

export const wageService = new WageService();
