import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class SettlementService {
  public async recordSettlement(orderId: string, data: any, userId: string) {
    const { originalValue, additionalFees, compensation, paidAmount, remainingAmount, evidences } = data;

    const expectedRemaining = Number(originalValue) + Number(additionalFees || 0) - Number(compensation || 0) - Number(paidAmount || 0);
    
    if (Math.abs(expectedRemaining - remainingAmount) > 0.1) {
      throw new AppError('Settlement discrepancy detected.', 400, 'MSG-UC30-01');
    }

    const newSettlement = await prisma.settlement.create({
      data: {
        orderId: BigInt(orderId),
        originalValue,
        additionalFee: additionalFees || 0,
        compensation: compensation || 0,
        totalPaid: paidAmount || 0,
        remainingAmount,
        status: 'draft',
        recordedBy: BigInt(userId),
      },
    });

    if (evidences && Array.isArray(evidences)) {
      for (const e of evidences) {
        await prisma.evidence.create({
          data: {
            refType: 'Settlement',
            refId: newSettlement.settlementId,
            fileUrl: e.fileUrl,
            uploadedBy: BigInt(userId)
          }
        });
      }
    }

    return newSettlement;
  }

  public async confirmSettlement(id: string, status: string, userId: string) {
    if (status !== 'confirmed' && status !== 'CONFIRMED') {
      throw new AppError('Status must be confirmed.', 400);
    }

    const settlement = await prisma.settlement.findUnique({ where: { settlementId: BigInt(id) } });
    if (!settlement) throw new AppError('Settlement not found', 404);

    await prisma.$transaction([
      prisma.settlement.update({
        where: { settlementId: BigInt(id) },
        data: { 
          status: 'confirmed',
          confirmedBy: BigInt(userId) 
        },
      }),
      prisma.order.update({
        where: { orderId: settlement.orderId },
        data: { status: 'settlement_pending' },
      }),
    ]);

    await prisma.auditLog.create({
      data: {
        userId: BigInt(userId),
        action: 'CONFIRM_SETTLEMENT',
        entityType: 'Settlement',
        entityId: BigInt(id),
      },
    });
  }
}

export const settlementService = new SettlementService();
