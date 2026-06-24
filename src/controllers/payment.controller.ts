import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getPaymentsByOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const payments = await prisma.payment.findMany({
      where: { orderId },
      include: { evidences: true },
      orderBy: { createdAt: 'desc' },
    });

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
    const { orderId } = req.params;
    const { amount, paymentType, paymentMethod } = req.body;

    if (!amount || !paymentType || !paymentMethod) {
      return next(new AppError('Required information is missing', 400, 'MSG-UC19-01'));
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { quotations: { where: { status: 'ACCEPTED' } } },
    });

    if (!order) return next(new AppError('Order not found', 404));

    // Optional BR: Check if amount exceeds total
    if (order.quotations.length > 0) {
      const totalAmount = order.quotations[0].totalAmount;
      if (amount > totalAmount) {
        // Just a simple validation
      }
    }

    const newPayment = await prisma.payment.create({
      data: {
        orderId,
        amount,
        paymentType,
        paymentMethod,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Payment request created.',
      data: {
        id: newPayment.id,
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

    if (status !== 'COMPLETED') {
      return next(new AppError('Status must be COMPLETED', 400));
    }

    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return next(new AppError('Payment not found', 404));

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          paymentDate: new Date(),
          evidences: evidenceUrl ? {
            create: {
              fileUrl: evidenceUrl,
              evidenceType: 'PAYMENT_RECEIPT',
              uploadedBy: req.user!.userId,
            },
          } : undefined,
        },
      });

      // Update order status if needed. Simplified logic.
      if (payment.paymentType === 'DEPOSIT') {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'DEPOSIT_PAID' },
        });
      }
    });

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
