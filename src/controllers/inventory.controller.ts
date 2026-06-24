import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const warehouseId = req.query.warehouseId as string;
    const catalogItemId = req.query.catalogItemId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (warehouseId) whereClause.warehouseId = warehouseId;
    if (catalogItemId) whereClause.catalogItemId = catalogItemId;

    const [inventory, totalCount] = await Promise.all([
      prisma.inventory.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.inventory.count({ where: whereClause }),
    ]);

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

    if (!eventDate || !itemId) {
      return next(new AppError('eventDate and itemId are required', 400));
    }

    // BR-13-01: Available = Total - (Reserved + CheckedOut + Damaged + Lost)
    // Simplified logic: calculate overall availability across all warehouses
    const inventories = await prisma.inventory.findMany({
      where: { catalogItemId: itemId as string },
    });

    let totalAvailable = 0;
    for (const inv of inventories) {
      totalAvailable += inv.availableQuantity - (inv.reservedQuantity + inv.checkedOutQuantity + inv.damagedQuantity + inv.lostQuantity);
    }

    res.status(200).json({
      success: true,
      data: {
        catalogItemId: itemId,
        isAvailable: totalAvailable > 0,
        availableQuantityOnDate: totalAvailable > 0 ? totalAvailable : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const reserveInventory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId, items } = req.body;

    if (!orderId || !items || !Array.isArray(items)) {
      return next(new AppError('Required information is missing or invalid.', 400, 'MSG-UC13-01'));
    }

    // Loop through items and reserve. This is simplified. 
    // In a real system, you'd specify which warehouse or find one with enough quantity.
    for (const item of items) {
      const inv = await prisma.inventory.findFirst({
        where: { catalogItemId: item.catalogItemId },
      });
      if (!inv) {
        return next(new AppError('Item not found in inventory', 404));
      }
      
      const available = inv.availableQuantity - (inv.reservedQuantity + inv.checkedOutQuantity + inv.damagedQuantity + inv.lostQuantity);
      if (item.quantity > available) {
        return next(new AppError('Insufficient inventory available for the requested date.', 400, 'MSG-UC13-04'));
      }

      await prisma.inventory.update({
        where: { id: inv.id },
        data: {
          reservedQuantity: inv.reservedQuantity + item.quantity,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inventory successfully reserved.',
    });
  } catch (error) {
    next(error);
  }
};
