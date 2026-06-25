import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class DamageLossService {
  public async recordDamageLoss(orderId: string, data: any, userId: string) {
    const { reportDetails, evidences } = data;

    // BR-28-01: Must specify responsible party
    const invalidItems = reportDetails.items.filter((i: any) => !i.responsible);
    if (invalidItems.length > 0) {
      throw new AppError('Must specify responsible party for all items.', 400, 'MSG-UC28-01');
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
          catalogItemId: BigInt(item.catalogItemId),
          quantity: item.quantity,
          damageType: item.type,
          source: item.responsible === 'supplier' ? 'supplier' : 'internal'
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
