import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export class OrderController {
  static async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.createOrder(req.body, req.user!.userId);
      sendSuccess(res, 'Tạo đơn hàng thành công', order, 'MSG-CO-01', 201);
    } catch (error) { next(error); }
  }

  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const customerId = req.query.customer_id as string;
      const fromDate = req.query.from_date as string;
      const toDate = req.query.to_date as string;

      const result = await OrderService.getOrders(page, limit, status, customerId, fromDate, toDate);
      sendSuccess(res, 'Lấy danh sách đơn hàng thành công', result.data, 'SUCCESS', 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        total_pages: result.totalPages
      });
    } catch (error) { next(error); }
  }

  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.getOrderById(req.params.id);
      sendSuccess(res, 'Lấy chi tiết đơn hàng thành công', order);
    } catch (error) { next(error); }
  }

  static async getStatusHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await OrderService.getStatusHistory(req.params.id);
      sendSuccess(res, 'Lấy lịch sử trạng thái thành công', history);
    } catch (error) { next(error); }
  }

  static async updateOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.updateOrder(req.params.id, req.body, req.user!.userId);
      sendSuccess(res, 'Cập nhật đơn hàng thành công', order, 'MSG-UO-01');
    } catch (error) { next(error); }
  }

  static async confirmOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.confirmOrder(req.params.id, req.user!.userId);
      sendSuccess(res, 'Xác nhận đơn hàng thành công', result, 'MSG-COR-01');
    } catch (error) { next(error); }
  }

  static async changeDate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { new_event_date, reason } = req.body;
      const result = await OrderService.changeDate(req.params.id, new_event_date, reason, req.user!.userId);
      sendSuccess(res, 'Đổi ngày sự kiện thành công', result, 'MSG-CED-01');
    } catch (error) { next(error); }
  }

  static async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      const result = await OrderService.cancelOrder(req.params.id, reason, req.user!.userId);
      sendSuccess(res, 'Hủy đơn hàng thành công', result, 'MSG-CAN-01');
    } catch (error) { next(error); }
  }

  static async getOrderItems(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await OrderService.getOrderItems(req.params.id);
      sendSuccess(res, 'Lấy hạng mục đơn hàng thành công', items);
    } catch (error) { next(error); }
  }

  static async addOrderItems(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { items } = req.body;
      const result = await OrderService.addOrderItems(req.params.id, items);
      sendSuccess(res, 'Thêm hạng mục đơn hàng thành công', result, 'MSG-CO-05', 201);
    } catch (error) { next(error); }
  }

  static async createPickList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.createPickList(req.params.id, req.body, req.user!.userId);
      sendSuccess(res, 'Tạo phiếu xuất kho thành công', result, 'MSG-PL-01', 201);
    } catch (error) { next(error); }
  }

  static async getReturnStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.getReturnStatus(req.params.id);
      sendSuccess(res, 'Lấy trạng thái hoàn trả thành công', result);
    } catch (error) { next(error); }
  }

  static async confirmReturn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.confirmReturn(req.params.id, req.user!.userId);
      sendSuccess(res, 'Đã xác nhận hoàn trả kho', result, 'MSG-CIR-01');
    } catch (error) { next(error); }
  }

  static async assignUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.assignUser(req.params.id, req.body, req.user!.userId);
      sendSuccess(res, 'Phân công thành công', result, 'MSG-AS-01', 201);
    } catch (error) { next(error); }
  }

  static async createSchedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.createSchedule(req.params.id, req.body, req.user!.userId);
      sendSuccess(res, 'Đã lập lịch vận chuyển', result, 'MSG-TS-01', 201);
    } catch (error) { next(error); }
  }

  static async getProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.getProgress(req.params.id);
      sendSuccess(res, 'Tiến độ hiện trường', result);
    } catch (error) { next(error); }
  }

  static async createDepositRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.createDepositRequest(req.params.id, req.body, req.user!.userId);
      sendSuccess(res, 'Tạo yêu cầu đặt cọc thành công', result, 'MSG-DPR-01', 201);
    } catch (error) { next(error); }
  }

  static async recordFinalPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.recordFinalPayment(req.params.id, req.body, req.user!.userId);
      sendSuccess(res, 'Ghi nhận thanh toán cuối thành công', result, 'MSG-FNL-01', 201);
    } catch (error) { next(error); }
  }

  static async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.getPayments(req.params.id);
      sendSuccess(res, 'Danh sách thanh toán', result);
    } catch (error) { next(error); }
  }

  static async getSettlement(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.getSettlement(req.params.id);
      sendSuccess(res, 'Chi tiết quyết toán', result);
    } catch (error) { next(error); }
  }

  static async createHandover(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.createHandover(req.params.id, req.body, req.user!.userId);
      sendSuccess(res, 'Đã ghi nhận bàn giao', result, 'MSG-HO-01', 201);
    } catch (error) { next(error); }
  }

  static async createChangeRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.createChangeRequest(req.params.id, req.body, req.user!.userId);
      sendSuccess(res, 'Đã nộp yêu cầu thay đổi', result, 'MSG-CR-02', 201);
    } catch (error) { next(error); }
  }

  static async createDamageLossReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.createDamageLossReport(req.params.id, req.body, req.user!.userId);
      sendSuccess(res, 'Đã ghi nhận biên bản hư hỏng/mất mát', result, 'MSG-DL-01', 201);
    } catch (error) { next(error); }
  }

  static async updateSettlement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.updateSettlement(req.params.id, req.body, req.user!.userId);
      sendSuccess(res, 'Đã ghi nhận chi tiết quyết toán', result, 'MSG-ST-01');
    } catch (error) { next(error); }
  }
}