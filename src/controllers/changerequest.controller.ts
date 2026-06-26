import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { changeRequestService } from '../services/changerequest.service';

export const getChangeRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const orderId = req.query.orderId as string;
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

export const createChangeRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const finalOrderId = req.params.orderId || req.body.orderId;
    const userId = req.user!.userId;

    const newRequest = await changeRequestService.createChangeRequest(finalOrderId, req.body, userId);

    res.status(201).json({
      success: true,
      message: 'Change request submitted for approval.',
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
      message: 'Change request status updated.',
    });
  } catch (error) {
    next(error);
  }
};
