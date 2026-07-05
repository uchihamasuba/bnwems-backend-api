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

    let totalCompensation = 0;

    for (const item of reportDetails.items) {
      const equipment = await prisma.equipment.findUnique({ where: { equipmentItemId: BigInt(item.equipmentItemId) } });
      const replacementValue = equipment ? Number(equipment.replacementValue) : 0;
      const compensationAmount = item.type === 'damaged' || item.type === 'lost' ? replacementValue * item.quantity : 0;
      totalCompensation += compensationAmount;

      await prisma.damageLossItem.create({
        data: {
          damageLossId: newReport.damageLossId,
          equipmentItemId: BigInt(item.equipmentItemId),
          quantity: item.quantity,
          damageType: item.type,
          source: item.responsibleParty === 'supplier' ? 'supplier' : 'internal',
          responsibleParty: item.responsibleParty,
          responsibleUserId: item.responsibleUserId ? BigInt(item.responsibleUserId) : null,
          compensationAmount: compensationAmount,
        }
      });
    }

    await prisma.damageLossReport.update({
      where: { damageLossId: newReport.damageLossId },
      data: { totalCompensation }
    });
    
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

  public async getDamageLossesByOrder(orderId: string) {
    const reports = await prisma.damageLossReport.findMany({
      where: { orderId: BigInt(orderId) },
      orderBy: { createdAt: 'desc' }
    });

    const items = await prisma.damageLossItem.findMany({
      where: {
        damageLossId: { in: reports.map(r => r.damageLossId) }
      }
    });

    return reports.map(r => ({
      ...r,
      items: items.filter(i => i.damageLossId === r.damageLossId)
    }));
  }
}

export const damageLossService = new DamageLossService();
