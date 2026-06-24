import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { settlementService } from '../services/settlement.service';

export const recordSettlement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const userId = req.user!.userId;

    const newSettlement = await settlementService.recordSettlement(orderId, req.body, userId);

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
    const userId = req.user!.userId;

    await settlementService.confirmSettlement(id, status, userId);

    res.status(200).json({
      success: true,
      message: 'Settlement confirmed.',
    });
  } catch (error) {
    next(error);
  }
};
