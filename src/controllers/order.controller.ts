import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';

export const orderController = {
  async getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await orderService.getOrders({
        status: req.query.status as string | undefined,
        page: req.query.page ? Number(req.query.page) : 1,
      });
      res.status(200).json({ success: true, statusCode: 200, ...result });
    } catch (err) { next(err); }
  },

  async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await orderService.getOrderById(Number(req.params.id));
      res.status(200).json({ success: true, statusCode: 200, data });
    } catch (err) { next(err); }
  },

  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await orderService.createOrder(req.body);
      res.status(201).json({ success: true, statusCode: 201, message: 'Đơn hàng được khởi tạo thành công (MSG-CO03).', data });
    } catch (err) { next(err); }
  },

  async createQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await orderService.createQuotation(Number(req.params.id), req.body);
      res.status(201).json({ success: true, statusCode: 201, message: 'Tạo báo giá thành công cho đơn hàng.', ...data });
    } catch (err) { next(err); }
  },

  async confirmQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await orderService.confirmQuotation(Number(req.params.id));
      res.status(200).json({ success: true, statusCode: 200, message: 'Xác nhận báo giá thành công. Trạng thái đơn hàng chuyển sang Chờ Đặt Cọc.' });
    } catch (err) { next(err); }
  },
};
