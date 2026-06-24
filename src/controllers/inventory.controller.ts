import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { inventoryService } from '../services/inventory.service';

export const getInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const warehouseId = req.query.warehouseId as string;
    const catalogItemId = req.query.catalogItemId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { inventory, totalCount } = await inventoryService.getInventory(warehouseId, catalogItemId, page, limit);

    res.status(200).json({
      success: true,
      data: inventory,
      meta: { page, limit, totalCount },
    });
  } catch (error) {
    next(error);
  }
};

export const checkAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventDate, itemId } = req.query;

    const data = await inventoryService.checkAvailability(eventDate as string, itemId as string);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const reserveInventory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId, items } = req.body;

    await inventoryService.reserveInventory(orderId, items);

    res.status(200).json({
      success: true,
      message: 'Inventory successfully reserved.',
    });
  } catch (error) {
    next(error);
  }
};
