import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export class WageService {
  static async approveWageSummary(id: string) {
    const wage = await prisma.wageSummary.update({
      where: { id: BigInt(id) },
      data: { status: 'approved' }
    });
    return {
      id: Number(wage.id),
      status: wage.status
    };
  }
}
