import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { warehouseService } from '../services/warehouse.service';

export const getWarehouseHistories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const movementType = req.query.transactionType as string; // API still sends transactionType
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { histories, totalCount } = await warehouseService.getWarehouseHistories(page, limit, movementType);

    res.status(200).json({
      success: true,
      data: histories,
      meta: { page, limit, totalCount },
    });
  } catch (error) {
    next(error);
  }
};

export const checkoutWarehouse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { warehouseId, orderId, items } = req.body;
    const actionUserId = req.user!.userId;

    await warehouseService.checkoutWarehouse(warehouseId, orderId, items, actionUserId);

    res.status(200).json({
      success: true,
      message: 'Items checked out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const returnWarehouse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { warehouseId, orderId, items } = req.body;
    const actionUserId = req.user!.userId;

    await warehouseService.returnWarehouse(warehouseId, orderId, items, actionUserId);

    res.status(200).json({
      success: true,
      message: 'Items returned to warehouse.',
    });
  } catch (error) {
    next(error);
  }
};
