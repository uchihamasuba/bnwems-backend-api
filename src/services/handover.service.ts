import { prisma } from '../config/database';

class HandoverService {
  public async recordHandover(orderId: string, data: any, userId: string) {
    const { customerAgreed, notes, evidences } = data;

    if (!customerAgreed) {
      throw new Error('Khách hàng phải đồng ý biên bản bàn giao.');
    }

    const newHandover = await prisma.handoverRecord.create({
      data: {
        orderId: BigInt(orderId),
        note: notes,
        recordedBy: BigInt(userId),
        status: 'submitted'
      },
    });

    if (evidences && Array.isArray(evidences)) {
      for (const e of evidences) {
        await prisma.evidence.create({
          data: {
            refType: 'HandoverRecord',
            refId: newHandover.handoverId,
            fileUrl: e.fileUrl,
            uploadedBy: BigInt(userId)
          }
        });
      }
    }

    return { id: newHandover.handoverId };
  }
}

export const handoverService = new HandoverService();
