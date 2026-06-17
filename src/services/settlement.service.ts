import prisma from '../config/database';

export const settlementService = {
  async createSettlement(payload: {
    orderId: number;
    arisingFee: number;
    damageCompensationFee: number;
    totalFinalAmount: number;
    settlementNotes?: string;
  }) {
    const settlement = await prisma.settlement.create({
      data: {
        orderId: payload.orderId,
        arisingFee: payload.arisingFee,
        damageCompensationFee: payload.damageCompensationFee,
        totalFinalAmount: payload.totalFinalAmount,
        settlementNotes: payload.settlementNotes,
        status: 'DRAFT',
      },
    });

    return settlement;
  },

  async submitForApproval(settlementId: number) {
    const settlement = await prisma.settlement.findUnique({ where: { id: settlementId } });
    if (!settlement) {
      const err: Error & { statusCode?: number } = new Error('Không tìm thấy biên bản quyết toán.');
      err.statusCode = 404;
      throw err;
    }

    await prisma.settlement.update({
      where: { id: settlementId },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    });
  },
};
