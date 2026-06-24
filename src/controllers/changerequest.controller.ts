import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createChangeRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const { requestDetails, additionalCost } = req.body;

    const newRequest = await prisma.changeRequest.create({
      data: {
        orderId,
        requestDetails,
        additionalCost: additionalCost || 0,
        status: 'PENDING',
        requestedBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Change request submitted for approval.',
      data: newRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const approveChangeRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 'APPROVED' && status !== 'REJECTED') {
      return next(new AppError('Invalid status', 400));
    }

    const cr = await prisma.changeRequest.update({
      where: { id },
      data: { status },
    });

    // If APPROVED, BR-27-01: Approval updates Order financial totals.
    // Assuming updating Settlement or Quotation logic goes here in a real scenario.

    res.status(200).json({
      success: true,
      message: 'Change request status updated.',
    });
  } catch (error) {
    next(error);
  }
};
