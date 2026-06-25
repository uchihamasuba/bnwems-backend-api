import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { paymentService } from '../services/payment.service';

export const getPaymentsByOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    
    const payments = await paymentService.getPaymentsByOrder(orderId);

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

export const requestPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const finalOrderId = req.params.orderId || req.body.orderId;
    const { amount, paymentType, paymentMethod } = req.body;
    const userId = req.user!.userId;

    const newPayment = await paymentService.requestPayment(finalOrderId, amount, paymentType, paymentMethod, userId);

    res.status(201).json({
      success: true,
      message: 'Payment request created.',
      data: {
        id: newPayment.paymentRequestId,
        paymentUrl: paymentMethod === 'VNPAY_QR' ? 'vnpay-mock-url' : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const confirmPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, evidenceUrl } = req.body;
    const userId = req.user?.userId;

    await paymentService.confirmPayment(id, status, evidenceUrl, userId);

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
