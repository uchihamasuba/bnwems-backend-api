import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { supplierTxService } from '../services/suppliertx.service';

export const getSupplierTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const supplierId = req.query.supplierId as string;
    const orderId = req.query.orderId as string;
    const status = req.query.status as string;

    const { transactions, totalCount } = await supplierTxService.getSupplierTransactions(page, limit, supplierId, orderId, status);

    res.status(200).json({
      success: true,
      data: transactions,
      meta: { page, limit, totalCount },
    });
  } catch (error) {
    next(error);
  }
};

export const getSupplierTransactionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const transaction = await supplierTxService.getSupplierTransactionById(id);

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

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

export const updateSupplierTxStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, evidenceUrls } = req.body;
    const userId = req.user!.userId;

    await supplierTxService.updateSupplierTxStatus(id, status, evidenceUrls, userId);

    res.status(200).json({
      success: true,
      message: 'Supplier transaction status updated.',
    });
  } catch (error) {
    next(error);
  }
};

export const paySupplierTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { amount, paymentRef } = req.body;
    const userId = req.user!.userId;

    await supplierTxService.paySupplierTransaction(id, amount, paymentRef, userId);

    res.status(200).json({
      success: true,
      message: 'Supplier payment recorded successfully.',
    });
  } catch (error) {
    next(error);
  }
};
