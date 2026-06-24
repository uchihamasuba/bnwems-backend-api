import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const recordHandover = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const { customerAgreed, notes, evidences } = req.body;

    if (customerAgreed === undefined || !evidences || !Array.isArray(evidences) || evidences.length === 0) {
      return next(new AppError('Missing customer signature/evidence for handover.', 400, 'MSG-UC26-01'));
    }

    const newHandover = await prisma.handoverRecord.create({
      data: {
        orderId,
        customerAgreed,
        notes,
        evidences: {
          create: evidences.map(e => ({
            fileUrl: e.fileUrl,
            evidenceType: 'HANDOVER_PHOTO',
            uploadedBy: req.user!.userId,
          })),
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Handover record created.',
      data: { id: newHandover.id },
    });
  } catch (error) {
    next(error);
  }
};
