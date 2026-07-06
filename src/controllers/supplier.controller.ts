import { Request, Response, NextFunction } from 'express';
import { supplierService } from '../services/supplier.service';
import { BigIntUtils } from '../utils/bigint.util';
import { SupplierStatus, TransactionStatus, PaymentStatus } from '@prisma/client';

export const supplierController = {
  // ============================================================================
  // SUPPLIER
  // ============================================================================

  async getSuppliers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const status = req.query.status as SupplierStatus;

      const { suppliers, totalCount } = await supplierService.getSuppliers(
        page,
        limit,
        search,
        status,
      );

      res.status(200).json({
        success: true,
        code: 'MSG-SP-01',
        data: BigIntUtils.toJSON(suppliers),
        meta: { page, limit, totalCount },
      });
    } catch (error) {
      next(error);
    }
  },

  async createSupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.userId;
      const newSupplier = await supplierService.createSupplier(req.body, userId);

      res.status(201).json({
        success: true,
        code: 'MSG-SP-02',
        message: 'Tạo nhà cung cấp thành công.',
        data: BigIntUtils.toJSON(newSupplier),
      });
    } catch (error) {
      next(error);
    }
  },

  async updateSupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedSupplier = await supplierService.updateSupplier(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Cập nhật nhà cung cấp thành công.',
        data: BigIntUtils.toJSON(updatedSupplier),
      });
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // SUPPLIER TRANSACTIONS
  // ============================================================================

  async createSupplierTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.userId;
      const transaction = await supplierService.createSupplierTransaction(req.body, userId);

      res.status(201).json({
        success: true,
        code: 'MSG-SP-03',
        message: 'Tạo giao dịch nhà cung cấp thành công.',
        data: BigIntUtils.toJSON(transaction),
      });
    } catch (error) {
      next(error);
    }
  },

  async getSupplierTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const supplierId = req.query.supplierId as string;
      const paymentStatus = req.query.paymentStatus as PaymentStatus;
      const status = req.query.status as TransactionStatus;

      const { transactions, totalCount } = await supplierService.getSupplierTransactions(
        page,
        limit,
        supplierId,
        paymentStatus,
        status,
      );

      res.status(200).json({
        success: true,
        code: 'MSG-SP-04',
        data: BigIntUtils.toJSON(transactions),
        meta: { page, limit, totalCount },
      });
    } catch (error) {
      next(error);
    }
  },

  async getSupplierTransactionById(req: Request, res: Response, next: NextFunction) {
    try {
      const transaction = await supplierService.getSupplierTransactionById(req.params.id);

      res.status(200).json({
        success: true,
        data: BigIntUtils.toJSON(transaction),
      });
    } catch (error) {
      next(error);
    }
  },

  async updateSupplierTransactionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.body.status as TransactionStatus;
      const notes = req.body.notes as string;
      await supplierService.updateSupplierTransactionStatus(req.params.id, status, notes);

      res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái giao dịch thành công.',
      });
    } catch (error) {
      next(error);
    }
  },

  async updateSupplierTransactionPaymentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const paymentStatus = req.body.paymentStatus as PaymentStatus;
      await supplierService.updateSupplierTransactionPaymentStatus(req.params.id, paymentStatus);

      res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái thanh toán thành công.',
      });
    } catch (error) {
      next(error);
    }
  },

  async receiveSupplierTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      await supplierService.receiveSupplierTransaction(req.params.id, req.body.items);

      res.status(200).json({
        success: true,
        code: 'MSG-SP-05',
        message: 'Đã cập nhật số lượng nhận hàng từ nhà cung cấp.',
      });
    } catch (error) {
      next(error);
    }
  },
};
