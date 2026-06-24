import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const recordSettlement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const { originalValue, additionalFees, compensation, paidAmount, remainingAmount, evidences } = req.body;

    if (originalValue === undefined || remainingAmount === undefined) {
      return next(new AppError('Required settlement fields missing.', 400));
    }

    // BR-30-01: remainingAmount = originalValue + additionalFees - compensation - paidAmount
    const expectedRemaining = Number(originalValue) + Number(additionalFees || 0) - Number(compensation || 0) - Number(paidAmount || 0);
    
    // Allow small floating point tolerance, or just strict check
    if (Math.abs(expectedRemaining - remainingAmount) > 0.1) {
      return next(new AppError('Settlement discrepancy detected.', 400, 'MSG-UC30-01'));
    }

    const newSettlement = await prisma.settlement.create({
      data: {
        orderId,
        originalValue,
        additionalFees: additionalFees || 0,
        compensation: compensation || 0,
        paidAmount: paidAmount || 0,
        remainingAmount,
        status: 'DRAFT',
        evidences: evidences && Array.isArray(evidences) ? {
          create: evidences.map(e => ({
            fileUrl: e.fileUrl,
            evidenceType: 'OTHER',
            uploadedBy: req.user!.userId,
          })),
        } : undefined,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Field settlement recorded.',
      data: { id: newSettlement.id },
    });
  } catch (error) {
    next(error);
  }
};

export const confirmSettlement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 'CONFIRMED') {
      return next(new AppError('Status must be CONFIRMED.', 400));
    }

    const settlement = await prisma.settlement.findUnique({ where: { id } });
    if (!settlement) return next(new AppError('Settlement not found', 404));

    await prisma.$transaction([
      prisma.settlement.update({
        where: { id },
        data: { status: 'CONFIRMED' },
      }),
      prisma.order.update({
        where: { id: settlement.orderId },
        data: { status: 'SETTLEMENT_PENDING' }, // Or COMPLETED based on flow
      }),
    ]);

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'CONFIRM_SETTLEMENT',
        entityType: 'Settlement',
        entityId: id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Settlement confirmed.',
    });
  } catch (error) {
    next(error);
  }
};
