import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { damageLossService } from '../services/damageloss.service';

export const recordDamageLoss = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const userId = req.user!.userId;

    const newReport = await damageLossService.recordDamageLoss(orderId, req.body, userId);

    res.status(201).json({
      success: true,
      message: 'Gửi báo cáo hư hỏng/mất mát thành công.',
      data: { id: newReport.id },
    });
  } catch (error) {
    next(error);
  }
};
