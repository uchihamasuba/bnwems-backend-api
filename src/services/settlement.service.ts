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
        orderId,
        originalValue,
        additionalFees: additionalFees || 0,
        compensation: compensation || 0,
        paidAmount: paidAmount || 0,
        remainingAmount,
        status: 'DRAFT',
        evidences: evidences && Array.isArray(evidences) ? {
          create: evidences.map((e: any) => ({
            fileUrl: e.fileUrl,
            evidenceType: 'OTHER',
            uploadedBy: userId,
          })),
        } : undefined,
      },
    });

    return newSettlement;
  }

  public async confirmSettlement(id: string, status: string, userId: string) {
    if (status !== 'CONFIRMED') {
      throw new AppError('Status must be CONFIRMED.', 400);
    }

    const settlement = await prisma.settlement.findUnique({ where: { id } });
    if (!settlement) throw new AppError('Settlement not found', 404);

    await prisma.$transaction([
      prisma.settlement.update({
        where: { id },
        data: { status: 'CONFIRMED' },
      }),
      prisma.order.update({
        where: { id: settlement.orderId },
        data: { status: 'SETTLEMENT_PENDING' },
      }),
    ]);

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CONFIRM_SETTLEMENT',
        entityType: 'Settlement',
        entityId: id,
      },
    });
  }
}

export const settlementService = new SettlementService();
