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
        orderId,
        reportDetails,
        status: 'PENDING',
        evidences: {
          create: evidences.map((e: any) => ({
            fileUrl: e.fileUrl,
            evidenceType: 'LOSS_REPORT',
            uploadedBy: userId,
          })),
        },
      },
    });

    return newReport;
  }
}

export const damageLossService = new DamageLossService();
