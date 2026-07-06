import { Request, Response, NextFunction } from 'express';
import { quotationService } from '../services/quotation.service';
import { BigIntUtils } from '../utils/bigint.util';
import { QuotationStatus } from '@prisma/client';

export const quotationController = {
  async getCustomerQuotations(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.params.customerId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { quotations, totalCount } = await quotationService.getCustomerQuotations(
        customerId,
        page,
        limit,
      );

      res.status(200).json({
        success: true,
        code: 'MSG-QO-01',
        data: BigIntUtils.toJSON(quotations),
        meta: { page, limit, totalCount },
      });
    } catch (error) {
      next(error);
    }
  },

  async getQuotationById(req: Request, res: Response, next: NextFunction) {
    try {
      const quotation = await quotationService.getQuotationById(req.params.id);

      res.status(200).json({
        success: true,
        code: 'MSG-QO-02',
        data: BigIntUtils.toJSON(quotation),
      });
    } catch (error) {
      next(error);
    }
  },

  async createQuotation(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.params.customerId;
      const userId = (req as any).user!.userId;

      const newQuotation = await quotationService.createQuotation(customerId, req.body, userId);

      res.status(201).json({
        success: true,
        code: 'MSG-QO-03',
        message: 'Tạo báo giá thành công.',
        data: BigIntUtils.toJSON(newQuotation),
      });
    } catch (error) {
      next(error);
    }
  },

  async updateQuotation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.userId;
      await quotationService.updateQuotation(req.params.id, req.body, userId);

      res.status(200).json({
        success: true,
        code: 'MSG-QO-04',
        message: 'Cập nhật báo giá thành công.',
      });
    } catch (error) {
      next(error);
    }
  },

  async updateQuotationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.userId;
      const status = req.body.status as QuotationStatus;
      await quotationService.updateQuotationStatus(req.params.id, status, userId);

      res.status(200).json({
        success: true,
        code: 'MSG-QO-05',
        message: 'Cập nhật trạng thái báo giá thành công.',
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteQuotation(req: Request, res: Response, next: NextFunction) {
    try {
      await quotationService.deleteQuotation(req.params.id);

      res.status(200).json({
        success: true,
        code: 'MSG-QO-06',
        message: 'Xóa báo giá thành công.',
      });
    } catch (error) {
      next(error);
    }
  },
};
