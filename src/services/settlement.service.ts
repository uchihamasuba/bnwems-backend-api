import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class SettlementService {
  public async recordSettlement(orderId: string, data: any, userId: string) {
    const { originalValue, changeAdjustment, additionalFee, compensation, discount, totalAmount, totalPaid, remainingAmount, settlementLines, evidences } = data;

    const expectedRemaining = Number(originalValue) + Number(changeAdjustment || 0) + Number(additionalFee || 0) - Number(compensation || 0) - Number(discount || 0) - Number(totalPaid || 0);
    
    if (Math.abs(expectedRemaining - remainingAmount) > 0.1) {
      throw new AppError('Phát hiện có sự sai lệch trong quyết toán.', 400, 'MSG-UC30-01');
    }

    const newSettlement = await prisma.settlement.create({
      data: {
        orderId: BigInt(orderId),
        originalValue,
        changeAdjustment: changeAdjustment || 0,
        additionalFee: additionalFee || 0,
        compensation: compensation || 0,
        discount: discount || 0,
        totalAmount: totalAmount || (Number(originalValue) + Number(changeAdjustment || 0) + Number(additionalFee || 0) - Number(compensation || 0) - Number(discount || 0)),
        totalPaid: totalPaid || 0,
        remainingAmount,
        status: 'draft',
        recordedBy: BigInt(userId),
      },
    });

    if (settlementLines && Array.isArray(settlementLines)) {
      await prisma.settlementLine.createMany({
        data: settlementLines.map((line: any) => ({
          settlementId: newSettlement.settlementId,
          lineType: line.lineType,
          amount: line.amount,
          note: line.note || null,
        }))
      });
    }

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
      throw new AppError('Trạng thái phải là đã xác nhận.', 400);
    }

    const settlement = await prisma.settlement.findUnique({ where: { settlementId: BigInt(id) } });
    if (!settlement) throw new AppError('Không tìm thấy quyết toán.', 404);

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

  public async getSettlementByOrder(orderId: string) {
    const settlement = await prisma.settlement.findFirst({
      where: { orderId: BigInt(orderId) },
      orderBy: { createdAt: 'desc' },
      include: {
        settlementLines: true
      }
    });

    if (!settlement) {
      throw new AppError('Không tìm thấy quyết toán.', 404);
    }

    return settlement;
  }
}

export const settlementService = new SettlementService();
