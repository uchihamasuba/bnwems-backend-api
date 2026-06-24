import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class PaymentService {
  public async getPaymentsByOrder(orderId?: string) {
    const whereClause = orderId ? { orderId } : {};
    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: { evidences: true },
      orderBy: { createdAt: 'desc' },
    });
    return payments;
  }

  public async requestPayment(finalOrderId: string, amount: number, paymentType: string, paymentMethod: string) {
    if (!finalOrderId || !amount || !paymentType || !paymentMethod) {
      throw new AppError('Required information is missing', 400, 'MSG-UC19-01');
    }

    const order = await prisma.order.findUnique({
      where: { id: finalOrderId },
      include: { quotations: { where: { status: 'ACCEPTED' } } },
    });

    if (!order) throw new AppError('Order not found', 404);

    if (order.quotations.length > 0) {
      const totalAmount = order.quotations[0].totalAmount;
      if (amount > totalAmount) {
        // Just a simple validation, no throw currently
      }
    }

    const newPayment = await prisma.payment.create({
      data: {
        orderId: finalOrderId,
        amount,
        paymentType: paymentType as any,
        paymentMethod: paymentMethod as any,
        status: 'PENDING',
      },
    });

    return newPayment;
  }

  public async confirmPayment(id: string, status: string, evidenceUrl?: string, userId?: string) {
    if (status !== 'COMPLETED') {
      throw new AppError('Status must be COMPLETED', 400);
    }

    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new AppError('Payment not found', 404);

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
              uploadedBy: userId || 'system',
            },
          } : undefined,
        },
      });

      if (payment.paymentType === 'DEPOSIT') {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'DEPOSIT_PAID' },
        });
      }
    });
  }
}

export const paymentService = new PaymentService();
