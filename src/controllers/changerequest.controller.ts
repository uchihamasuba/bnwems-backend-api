import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { changeRequestService } from '../services/changerequest.service';

export const getChangeRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const orderId = req.params.orderId || req.query.orderId as string;
    const status = req.query.status as string;

    const { requests, totalCount } = await changeRequestService.getChangeRequests(page, limit, orderId, status);

    res.status(200).json({
      success: true,
      data: requests,
      meta: { page, limit, totalCount },
    });
  } catch (error) {
    next(error);
  }
};

export const getChangeRequestById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const request = await changeRequestService.getChangeRequestById(id);

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

export const createChangeRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const finalOrderId = req.params.orderId || req.body.orderId;
    const userId = req.user!.userId;

    const newRequest = await changeRequestService.createChangeRequest(finalOrderId, req.body, userId);

    res.status(201).json({
      success: true,
      message: 'Đã gửi yêu cầu thay đổi để phê duyệt.',
      data: newRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const approveChangeRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await changeRequestService.approveChangeRequest(id, status);

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái yêu cầu thay đổi.',
    });
  } catch (error) {
    next(error);
  }
};
