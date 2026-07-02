import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class DamageLossService {
  public async recordDamageLoss(orderId: string, data: any, userId: string) {
    const { reportDetails, evidences } = data;

    // BR-28-01: Must specify responsible party
    const invalidItems = reportDetails.items.filter((i: any) => !i.responsibleParty);
    if (invalidItems.length > 0) {
      throw new AppError('Phải chỉ định người chịu trách nhiệm cho tất cả các mục.', 400, 'MSG-UC28-01');
    }

    const newReport = await prisma.damageLossReport.create({
      data: {
        orderId: BigInt(orderId),
        recordedBy: BigInt(userId),
        status: 'submitted',
      },
    });

    for (const item of reportDetails.items) {
      await prisma.damageLossItem.create({
        data: {
          damageLossId: newReport.damageLossId,
          equipmentItemId: BigInt(item.equipmentItemId),
          quantity: item.quantity,
          damageType: item.type,
          source: item.responsibleParty === 'supplier' ? 'supplier' : 'internal',
          responsibleParty: item.responsibleParty,
          responsibleUserId: item.responsibleUserId ? BigInt(item.responsibleUserId) : null
        }
      });
    }
    
    if (evidences && Array.isArray(evidences)) {
      for (const e of evidences) {
        await prisma.evidence.create({
          data: {
            refType: 'DamageLossReport',
            refId: newReport.damageLossId,
            fileUrl: e.fileUrl,
            uploadedBy: BigInt(userId)
          }
        });
      }
    }

    return { id: newReport.damageLossId };
  }
}

export const damageLossService = new DamageLossService();
