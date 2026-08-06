import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { BigIntUtils } from '../utils/bigint.util';
import { OrderStatus, PaymentStatus, DepositStatus, SettlementStatus } from '@prisma/client';

export const orderController = {
  // ============================================================================
  // ORDERS
  // ============================================================================

  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const orderStatus = req.query.orderStatus as OrderStatus;
      const paymentStatus = req.query.paymentStatus as PaymentStatus;

      const { orders, totalCount } = await orderService.getOrders(
        page,
        limit,
        orderStatus,
        paymentStatus,
        search,
      );

      res.status(200).json({
        success: true,
        code: 'MSG-CO-01',
        data: BigIntUtils.toJSON(orders),
        meta: { page, limit, totalCount },
      });
    } catch (error) {
      next(error);
    }
  },

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getOrderById(req.params.id);

      res.status(200).json({
        success: true,
        code: 'MSG-CO-02',
        data: BigIntUtils.toJSON(order),
      });
    } catch (error) {
      next(error);
    }
  },

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.userId;
      const newOrder = await orderService.createOrder(req.body, userId);

      res.status(201).json({
        success: true,
        code: 'MSG-CO-03',
        message: 'Tạo đơn hàng thành công.',
        data: {
          orderId: BigIntUtils.toJSON(newOrder.orderId),
          orderCode: newOrder.orderCode,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderStatus, cancelReason, notes } = req.body;
      await orderService.updateOrderStatus(req.params.id, orderStatus, cancelReason, notes);

      res.status(200).json({
        success: true,
        code: 'MSG-CO-04',
        message: 'Cập nhật trạng thái đơn hàng thành công.',
      });
    } catch (error) {
      next(error);
    }
  },

  async updateOrderItems(req: Request, res: Response, next: NextFunction) {
    try {
      await orderService.updateOrderItems(req.params.id, req.body.items);

      res.status(200).json({
        success: true,
        code: 'MSG-CO-05',
        message: 'Cập nhật danh sách thiết bị thành công.',
      });
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // ORDER WARNINGS
  // ============================================================================

  async getOrderWarnings(req: Request, res: Response, next: NextFunction) {
    try {
      const warnings = await orderService.getOrderWarnings(req.params.id);

      res.status(200).json({
        success: true,
        code: 'MSG-CO-06',
        data: BigIntUtils.toJSON(warnings),
      });
    } catch (error) {
      next(error);
    }
  },

  async createOrderWarning(req: Request, res: Response, next: NextFunction) {
    try {
      await orderService.createOrderWarning(req.params.id, req.body.content);

      res.status(201).json({
        success: true,
        code: 'MSG-CO-07',
        message: 'Tạo cảnh báo thành công.',
      });
    } catch (error) {
      next(error);
    }
  },

  async resolveOrderWarning(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.userId;
      await orderService.resolveOrderWarning(req.params.id, userId);

      res.status(200).json({
        success: true,
        code: 'MSG-CO-08',
        message: 'Đã xử lý cảnh báo thành công.',
      });
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // DEPOSITS
  // ============================================================================

  async getOrderDeposits(req: Request, res: Response, next: NextFunction) {
    try {
      const deposits = await orderService.getOrderDeposits(req.params.id);

      res.status(200).json({
        success: true,
        code: 'MSG-PM-01',
        data: BigIntUtils.toJSON(deposits),
      });
    } catch (error) {
      next(error);
    }
  },

  async createOrderDeposit(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.userId;
      const { amount, paymentMethod, notes } = req.body;
      const newDeposit = await orderService.createOrderDeposit(
        req.params.id,
        amount,
        paymentMethod,
        notes,
        userId,
      );

      res.status(201).json({
        success: true,
        code: 'MSG-PM-02',
        message: 'Ghi nhận tiền cọc thành công.',
        data: { depositId: BigIntUtils.toJSON(newDeposit.depositId) },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateDepositStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.userId;
      const { status, notes } = req.body;
      await orderService.updateDepositStatus(req.params.id, status as DepositStatus, notes, userId);

      res.status(200).json({
        success: true,
        code: 'MSG-PM-03',
        message: 'Cập nhật trạng thái tiền cọc thành công.',
      });
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // SETTLEMENTS
  // ============================================================================

  async getOrderSettlement(req: Request, res: Response, next: NextFunction) {
    try {
      const settlement = await orderService.getOrderSettlement(req.params.id);

      res.status(200).json({
        success: true,
        code: 'MSG-PM-04',
        data: BigIntUtils.toJSON(settlement),
      });
    } catch (error) {
      next(error);
    }
  },

  async createOrderSettlement(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.userId;
      const newSettlement = await orderService.createOrderSettlement(
        req.params.id,
        req.body,
        userId,
      );

      res.status(201).json({
        success: true,
        code: 'MSG-PM-05',
        message: 'Tạo biên bản quyết toán thành công.',
        data: { settlementId: BigIntUtils.toJSON(newSettlement.settlementId) },
      });
    } catch (error) {
      next(error);
    }
  },

  async confirmSettlement(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.userId;
      const { status, notes } = req.body;
      await orderService.confirmSettlement(
        req.params.id,
        status as SettlementStatus,
        notes,
        userId,
      );

      res.status(200).json({
        success: true,
        code: 'MSG-PM-06',
        message: 'Xác nhận quyết toán thành công.',
      });
    } catch (error) {
      next(error);
    }
  },
};
