import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

// 1. Supplier Master Data
export const getSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as any;

    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (search) {
      whereClause.name = { contains: search };
    }
    if (status) whereClause.status = status;

    const [suppliers, totalCount] = await Promise.all([
      prisma.supplier.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.supplier.count({ where: whereClause }),
    ]);

    res.status(200).json({
      success: true,
      data: suppliers,
      meta: { page, limit, totalCount },
    });
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, contactPerson, phone, email, address } = req.body;

    if (!name) {
      return next(new AppError('Supplier name is required.', 400, 'MSG-UC16-01'));
    }

    const newSupplier = await prisma.supplier.create({
      data: { name, contactPerson, phone, email, address },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'CREATE_SUPPLIER',
        entityType: 'Supplier',
        entityId: newSupplier.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully.',
      data: newSupplier,
    });
  } catch (error) {
    next(error);
  }
};
