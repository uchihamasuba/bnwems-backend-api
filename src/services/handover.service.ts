import { prisma } from '../config/database';

class HandoverService {
  public async recordHandover(orderId: string, data: any, userId: string) {
    const { customerAgreed, notes, evidences } = data;

    const newHandover = await prisma.handoverRecord.create({
      data: {
        orderId,
        customerAgreed,
        notes,
        evidences: {
          create: evidences.map((e: any) => ({
            fileUrl: e.fileUrl,
            evidenceType: 'HANDOVER_PHOTO',
            uploadedBy: userId,
          })),
        },
      },
    });

    return newHandover;
  }
}

export const handoverService = new HandoverService();
