import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { changeRequestService } from '../services/changerequest.service';

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
