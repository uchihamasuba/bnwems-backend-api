import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export const getWarehouseHistories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const transactionType = req.query.transactionType as string; // CHECKOUT, RETURN, ADJUSTMENT

    const skip = (page - 1) * limit;

    const where: Prisma.InventoryReportWhereInput = {};
    if (transactionType) {
      if (transactionType === 'CHECKOUT') where.reportType = 'checkout';
      else if (transactionType === 'RETURN') where.reportType = 'return';
      else if (transactionType === 'ADJUSTMENT') where.reportType = 'collection'; // map adjustment/collection appropriately
    }

    const [reports, totalCount] = await Promise.all([
      prisma.inventoryReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.inventoryReport.count({ where }),
    ]);

    const mapped = reports.map(r => {
      let type = 'ADJUSTMENT';
      if (r.reportType === 'checkout') type = 'CHECKOUT';
      if (r.reportType === 'return') type = 'RETURN';

      return {
        id: r.inventoryReportId.toString(),
        warehouseId: '1', // Default value since warehouse is removed
        transactionType: type,
        performedBy: r.recordedBy.toString(),
        createdAt: r.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      data: mapped,
      meta: { page, limit, totalCount },
    });
  } catch (error) {
    next(error);
  }
};
