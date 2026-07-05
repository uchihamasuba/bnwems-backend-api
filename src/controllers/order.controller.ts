import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { orderService } from '../services/order.service';

// Order Lifecycle (UC 2.11)
export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const { orders, totalCount } = await orderService.getOrders(page, limit, search, status, startDate, endDate);

    res.status(200).json({
      success: true,
      data: orders,
      meta: { page, limit, totalCount },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const actionUserId = req.user!.userId;
    const { customerId, eventDate, eventEndDate, eventType, eventName, notes, guestCount, venueAddress } = req.body;

    const result = await orderService.createOrder({ 
      customerId, 
      eventStartDate: eventDate,
      eventDate,
      eventEndDate,
      eventType,
      eventName,
      notes,
      guestCount: guestCount ? Number(guestCount) : undefined,
      venueAddress 
    }, actionUserId);

    res.status(201).json({
      success: true,
      message: 'Tạo đơn hàng thành công.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const actionUserId = req.user!.userId;
    const { id } = req.params;
    
    const updatedOrder = await orderService.updateOrder(id, req.body, actionUserId);

    res.status(200).json({
      success: true,
      message: 'Cập nhật đơn hàng thành công.',
      data: {
        ...updatedOrder,
        orderId: updatedOrder.orderId.toString(),
        customerId: updatedOrder.customerId.toString(),
        createdBy: updatedOrder.createdBy.toString()
      },
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const actionUserId = req.user!.userId;
    const { id } = req.params;
    const { reason } = req.body;

    await orderService.cancelOrder(id, reason, actionUserId);

    res.status(200).json({
      success: true,
      message: 'Hủy đơn hàng thành công.',
      data: { status: 'CANCELLED' }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderStatusHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const history = await orderService.getOrderStatusHistory(id);

    res.status(200).json({
      success: true,
      data: history.map(h => ({
        ...h,
        historyId: h.historyId.toString(),
        orderId: h.orderId.toString(),
        changedBy: h.changedBy?.toString()
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const confirmOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await orderService.confirmOrder(id);

    res.status(200).json({
      success: true,
      message: 'Xác nhận đơn hàng thành công.',
      data: { status: 'CONFIRMED' },
    });
  } catch (error) {
    next(error);
  }
};

export const changeEventDate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { newEventDate } = req.body;

    await orderService.changeEventDate(id, newEventDate);

    res.status(200).json({
      success: true,
      message: 'Cập nhật ngày đơn hàng thành công.',
    });
  } catch (error) {
    next(error);
  }
};

export const closeOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await orderService.closeOrder(id);

    res.status(200).json({
      success: true,
      message: 'Đóng đơn hàng thành công.',
      data: { status: 'COMPLETED' },
    });
  } catch (error) {
    next(error);
  }
};

export const getFieldProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.getFieldProgress();

    res.status(200).json({
      success: true,
      data,
      meta: { totalCount: data.length },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderEvidences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const evidences = await orderService.getOrderEvidences(id);
    res.status(200).json({
      success: true,
      data: evidences,
    });
  } catch (error) {
    next(error);
  }
};

export const getMobileSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const summary = await orderService.getMobileSummary(id);
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkflowTimeline = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const timeline = await orderService.getWorkflowTimeline(id);
    res.status(200).json({
      success: true,
      data: timeline,
    });
  } catch (error) {
    next(error);
  }
};
