import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const recordDamageLoss = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const { reportDetails, evidences } = req.body;

    if (!reportDetails || !reportDetails.items || reportDetails.items.length === 0) {
      return next(new AppError('Missing report details.', 400));
    }

    if (!evidences || !Array.isArray(evidences) || evidences.length === 0) {
      return next(new AppError('Missing evidence for damage/loss report.', 400, 'MSG-UC28-01'));
    }

    // BR-28-01: Must specify responsible party
    const invalidItems = reportDetails.items.filter((i: any) => !i.responsible);
    if (invalidItems.length > 0) {
      return next(new AppError('Must specify responsible party for all items.', 400, 'MSG-UC28-01'));
    }

    const newReport = await prisma.damageLossReport.create({
      data: {
        orderId,
        reportDetails,
        status: 'PENDING',
        evidences: {
          create: evidences.map(e => ({
            fileUrl: e.fileUrl,
            evidenceType: 'LOSS_REPORT', // or DAMAGE_PHOTO depending on type
            uploadedBy: req.user!.userId,
          })),
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Damage/Loss report submitted successfully.',
      data: { id: newReport.id },
    });
  } catch (error) {
    next(error);
  }
};
