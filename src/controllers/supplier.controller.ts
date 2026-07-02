import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { supplierService } from '../services/supplier.service';

// 1. Supplier Master Data
export const getSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as string;

    const { suppliers, totalCount } = await supplierService.getSuppliers(page, limit, search, status);

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
    const actionUserId = req.user!.userId;
    const newSupplier = await supplierService.createSupplier(req.body, actionUserId);

    res.status(201).json({
      success: true,
      message: 'Tạo nhà cung cấp thành công.',
      data: newSupplier,
    });
  } catch (error) {
    next(error);
  }
};
