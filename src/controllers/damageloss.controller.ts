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

export const getDamageLossesByOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const reports = await damageLossService.getDamageLossesByOrder(orderId);
    res.json({
      success: true,
      data: reports.map(r => ({
        ...r,
        damageLossId: r.damageLossId.toString(),
        orderId: r.orderId.toString(),
        recordedBy: r.recordedBy.toString(),
        confirmedBy: r.confirmedBy?.toString(),
        items: r.items.map((i: any) => ({
          ...i,
          id: i.id.toString(),
          damageLossId: i.damageLossId.toString(),
          equipmentItemId: i.equipmentItemId.toString(),
          supplierTransactionItemId: i.supplierTransactionItemId?.toString(),
          responsibleUserId: i.responsibleUserId?.toString()
        }))
      }))
    });
  } catch (error) {
    next(error);
  }
};
