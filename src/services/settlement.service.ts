import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export class SettlementService {
  static async approveSettlement(id: string, userId: string) {
    const settlement = await prisma.settlement.update({
      where: { id: BigInt(id) },
      data: {
        status: 'approved',
        approvedBy: BigInt(userId),
        approvedAt: new Date()
      }
    });

    return {
      id: Number(settlement.id),
      order_id: Number(settlement.orderId),
      balance: Number(settlement.balance),
      status: settlement.status
    };
  }

  static async submitSettlement(id: string, userId: string) {
    const settlement = await prisma.settlement.update({
      where: { id: BigInt(id) },
      data: { status: 'pending_approval' }
    });

    return {
      id: Number(settlement.id),
      status: settlement.status
    };
  }
}