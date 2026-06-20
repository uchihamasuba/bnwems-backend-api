import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export class DamageLossService {
  static async confirmDamageLoss(id: string, decision: string, notes: string, userId: string) {
    if (!['confirmed', 'rejected'].includes(decision)) {
      throw new AppError('Decision must be confirmed or rejected', 400);
    }
    const report = await prisma.damageLossReport.update({
      where: { id: BigInt(id) },
      data: {
        status: decision
      }
    });

    return {
      id: Number(report.id),
      status: report.status
    };
  }
}
