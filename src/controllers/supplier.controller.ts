import { Request, Response, NextFunction } from 'express';
import { SupplierService } from '../services/supplier.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export class SupplierController {
  static async getSuppliers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const status = req.query.status as string;

      const result = await SupplierService.getSuppliers(page, limit, search, status);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async createSupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const createdBy = Number((req as any).user?.userId);
      const data = await SupplierService.createSupplier(req.body, createdBy);
      res.status(201).json({ success: true, code: 'MSG-SUP-01', message: 'Tạo nhà cung cấp thành công', data });
    } catch (error) {
      next(error);
    }
  }

  static async updateSupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const data = await SupplierService.updateSupplier(id, req.body);
      res.status(200).json({ success: true, message: 'Cập nhật nhà cung cấp thành công', data });
    } catch (error) {
      next(error);
    }
  }

  static async updateSupplierStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const data = await SupplierService.updateSupplierStatus(id, status);
      res.status(200).json({ success: true, message: 'Cập nhật trạng thái nhà cung cấp thành công', data });
    } catch (error) {
      next(error);
    }
  }

  static async createSupplierPayable(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body, created_by: Number(req.user!.userId) };
      const result = await SupplierService.createSupplierPayable(data, Number(req.user!.userId));
      if (req.body.transaction_type === 'return') {
        sendSuccess(res, 'Đã ghi nhận trả thiết bị NCC', result, 'MSG-SRT-01', 201);
      } else {
        sendSuccess(res, 'Tạo công nợ thành công', result, 'MSG-SP-01', 201);
      }
    } catch (error) { next(error); }
  }

  static async receiptSupplierPayable(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await SupplierService.receiptSupplierPayable(req.params.id, req.body, req.user!.userId);
      sendSuccess(res, 'Đã ghi nhận nhận thiết bị NCC', result, 'MSG-SR-01');
    } catch (error) { next(error); }
  }

  static async getSupplierPayables(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const supplierId = req.query.supplier_id ? parseInt(req.query.supplier_id as string) : undefined;
      const status = req.query.status as string;

      const result = await SupplierService.getSupplierPayables(page, limit, supplierId, status);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async createSupplierPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const createdBy = Number((req as any).user?.userId);
      const data = await SupplierService.createSupplierPayment(req.body, createdBy);
      res.status(201).json({ success: true, code: 'MSG-SPAY-01', message: 'Ghi nhận thanh toán NCC thành công', data });
    } catch (error) {
      next(error);
    }
  }
}