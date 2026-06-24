import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getWarehouseHistories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionType = req.query.transactionType as any;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (transactionType) whereClause.transactionType = transactionType;

    const [histories, totalCount] = await Promise.all([
      prisma.warehouseHistory.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.warehouseHistory.count({ where: whereClause }),
    ]);

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

    if (!warehouseId || !orderId || !items || !Array.isArray(items)) {
      return next(new AppError('Required information missing', 400));
    }

    // BR-23-02: Decreases reservedQuantity and increases checkedOutQuantity
    for (const item of items) {
      const inv = await prisma.inventory.findFirst({
        where: { warehouseId, catalogItemId: item.catalogItemId },
      });
      if (!inv) continue;

      await prisma.inventory.update({
        where: { id: inv.id },
        data: {
          reservedQuantity: Math.max(0, inv.reservedQuantity - item.quantity),
          checkedOutQuantity: inv.checkedOutQuantity + item.quantity,
        },
      });
    }

    await prisma.warehouseHistory.create({
      data: {
        warehouseId,
        transactionType: 'CHECKOUT',
        details: items,
        performedBy: req.user!.userId,
      },
    });

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

    if (!warehouseId || !orderId || !items || !Array.isArray(items)) {
      return next(new AppError('Required information missing', 400));
    }

    for (const item of items) {
      const inv = await prisma.inventory.findFirst({
        where: { warehouseId, catalogItemId: item.catalogItemId },
      });
      if (!inv) continue;

      const isDamaged = item.condition === 'DAMAGED';
      const dq = isDamaged ? inv.damagedQuantity + item.quantity : inv.damagedQuantity;

      await prisma.inventory.update({
        where: { id: inv.id },
        data: {
          checkedOutQuantity: Math.max(0, inv.checkedOutQuantity - item.quantity),
          damagedQuantity: dq,
        },
      });
    }

    await prisma.warehouseHistory.create({
      data: {
        warehouseId,
        transactionType: 'RETURN',
        details: items,
        performedBy: req.user!.userId,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Items returned to warehouse.',
    });
  } catch (error) {
    next(error);
  }
};
