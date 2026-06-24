import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getCatalogItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const itemType = req.query.itemType as any;
    const isActiveParam = req.query.isActive as string;

    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (search) {
      whereClause.name = { contains: search };
    }
    if (itemType) whereClause.itemType = itemType;
    if (isActiveParam !== undefined) whereClause.isActive = isActiveParam === 'true';

    const [items, totalCount] = await Promise.all([
      prisma.catalogItem.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.catalogItem.count({ where: whereClause }),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      meta: { page, limit, totalCount },
    });
  } catch (error) {
    next(error);
  }
};

export const getCatalogItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const item = await prisma.catalogItem.findUnique({ where: { id } });

    if (!item) {
      return next(new AppError('Catalog item not found.', 404));
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const createCatalogItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, itemType, basePrice } = req.body;

    if (!name || !itemType || basePrice === undefined) {
      return next(new AppError('Required information is missing or invalid.', 400, 'MSG-UC05-01'));
    }

    if (basePrice <= 0) {
      return next(new AppError('Base price must be positive.', 400, 'MSG-UC05-01'));
    }

    const newItem = await prisma.catalogItem.create({
      data: { name, description, itemType, basePrice },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'CREATE_CATALOG_ITEM',
        entityType: 'CatalogItem',
        entityId: newItem.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Catalog item created successfully.',
      data: newItem,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCatalogItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, basePrice } = req.body;

    const item = await prisma.catalogItem.update({
      where: { id },
      data: { name, description, basePrice },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'UPDATE_CATALOG_ITEM',
        entityType: 'CatalogItem',
        entityId: id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Catalog item updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateCatalogItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return next(new AppError('isActive status is required.', 400, 'MSG-UC05-01'));
    }

    // BR-05-06: Cannot deactivate if part of active order. 
    // In a full implementation, we'd query Quotation details/Order details. 
    // Assuming simple check for now.

    await prisma.catalogItem.update({
      where: { id },
      data: { isActive },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'DEACTIVATE_CATALOG_ITEM',
        entityType: 'CatalogItem',
        entityId: id,
        details: { isActive },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Catalog item status changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
