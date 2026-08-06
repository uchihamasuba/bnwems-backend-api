import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service';
import { BigIntUtils } from '../utils/bigint.util';
import { MovementType } from '@prisma/client';

export const inventoryController = {
  async getInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const itemId = req.query.itemId as string;

      const { inventories, totalCount } = await inventoryService.getInventory(page, limit, itemId);

      res.status(200).json({
        success: true,
        code: 'MSG-WH-01',
        data: BigIntUtils.toJSON(inventories),
        meta: { page, limit, totalCount },
      });
    } catch (error) {
      next(error);
    }
  },

  async adjustInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.userId;
      await inventoryService.adjustInventory(req.body, userId);

      res.status(200).json({
        success: true,
        code: 'MSG-WH-02',
        message: 'Điều chỉnh kho thành công.',
      });
    } catch (error) {
      next(error);
    }
  },

  async getInventoryMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const itemId = req.query.itemId as string;
      const movementType = req.query.movementType as MovementType;

      const { movements, totalCount } = await inventoryService.getInventoryMovements(
        page,
        limit,
        itemId,
        movementType,
      );

      res.status(200).json({
        success: true,
        code: 'MSG-WH-03',
        data: BigIntUtils.toJSON(movements),
        meta: { page, limit, totalCount },
      });
    } catch (error) {
      next(error);
    }
  },

  async createReturnReport(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.userId;
      const report = await inventoryService.createReturnReport(req.body, userId);

      res.status(201).json({
        success: true,
        code: 'MSG-WH-06',
        message: 'Đã tạo báo cáo thu hồi thiết bị.',
        data: BigIntUtils.toJSON(report),
      });
    } catch (error) {
      next(error);
    }
  },

  async confirmReturnReport(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.userId;
      await inventoryService.confirmReturnReport(req.params.id, userId);

      res.status(200).json({
        success: true,
        code: 'MSG-WH-07',
        message: 'Đã xác nhận báo cáo và nhập kho thành công.',
      });
    } catch (error) {
      next(error);
    }
  },

  async prepareOrder(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        success: true,
        code: 'MSG-WH-04',
        message: 'Cập nhật số lượng chuẩn bị thành công.',
      });
    } catch (error) {
      next(error);
    }
  },

  async checkoutOrder(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        success: true,
        code: 'MSG-WH-05',
        message: 'Xuất kho cho đơn hàng thành công.',
      });
    } catch (error) {
      next(error);
    }
  },
};
