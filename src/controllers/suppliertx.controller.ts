import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { supplierTxService } from '../services/suppliertx.service';

export const createSupplierTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const newTx = await supplierTxService.createSupplierTransaction(req.body, userId);

    res.status(201).json({
      success: true,
      message: 'Supplier transaction created.',
      data: { id: newTx.supplierTransactionId, status: newTx.status },
    });
  } catch (error) {
    next(error);
  }
};

export const receiveSupplierItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { evidenceUrls } = req.body;
    const userId = req.user!.userId;

    await supplierTxService.receiveSupplierItems(id, evidenceUrls, userId);

    res.status(200).json({
      success: true,
      message: 'Items received and logged.',
    });
  } catch (error) {
    next(error);
  }
};

export const returnSupplierItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { evidenceUrls } = req.body;
    const userId = req.user!.userId;

    await supplierTxService.returnSupplierItems(id, evidenceUrls, userId);

    res.status(200).json({
      success: true,
      message: 'Items returned to supplier successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getSupplierDebts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { status, supplierId } = req.query;

    const { debts, totalCount } = await supplierTxService.getSupplierDebts(page, limit, status as string, supplierId as string);

    res.status(200).json({
      success: true,
      data: debts,
      meta: { page, limit, totalCount },
    });
  } catch (error) {
    next(error);
  }
};

export const paySupplierDebt = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    await supplierTxService.paySupplierDebt(id, amount);

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully.',
    });
  } catch (error) {
    next(error);
  }
};
