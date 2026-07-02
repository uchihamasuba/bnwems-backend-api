import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { handoverService } from '../services/handover.service';

export const recordHandover = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const userId = req.user!.userId;

    const newHandover = await handoverService.recordHandover(orderId, req.body, userId);

    res.status(201).json({
      success: true,
      message: 'Tạo biên bản bàn giao thành công.',
      data: { id: newHandover.id },
    });
  } catch (error) {
    next(error);
  }
};
