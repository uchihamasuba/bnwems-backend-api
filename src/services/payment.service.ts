import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class PaymentService {
  public async getPaymentsByOrder(orderId?: string) {
    const whereClause = orderId ? { orderId: BigInt(orderId) } : {};
    const payments = await prisma.payment.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
    
    // Manual mapping for evidences if needed, or just return payments
    return payments;
  }

  public async requestPayment(finalOrderId: string, amount: number, paymentType: string, paymentMethod: string, userId: string) {
    if (!finalOrderId || !amount || !paymentType || !paymentMethod) {
      throw new AppError('Required information is missing', 400, 'MSG-UC19-01');
    }

    const order = await prisma.order.findUnique({
      where: { orderId: BigInt(finalOrderId) }
    });

    if (!order) throw new AppError('Order not found', 404);

    const quote = await prisma.quotation.findUnique({
      where: { orderId: BigInt(finalOrderId) }
    });

    if (quote && quote.status === 'confirmed') {
      const totalAmount = Number(quote.totalAmount);
      if (amount > totalAmount) {
        // Just a simple validation, no throw currently
      }
    }

    const newPaymentRequest = await prisma.paymentRequest.create({
      data: {
        orderId: BigInt(finalOrderId),
        amount,
        paymentType,
        methodHint: paymentMethod,
        status: 'pending',
        createdBy: BigInt(userId),
      },
    });

    return newPaymentRequest;
  }

  public async confirmPayment(id: string, status: string, evidenceUrl?: string, userId?: string) {
    if (status !== 'completed' && status !== 'COMPLETED') {
      throw new AppError('Status must be completed', 400);
    }

    const pr = await prisma.paymentRequest.findUnique({ where: { paymentRequestId: BigInt(id) } });
    if (!pr) throw new AppError('Payment request not found', 404);

    await prisma.$transaction(async (tx) => {
      await tx.paymentRequest.update({
        where: { paymentRequestId: BigInt(id) },
        data: { status: 'paid' },
      });

      const payment = await tx.payment.create({
        data: {
          paymentRequestId: BigInt(id),
          orderId: pr.orderId,
          amount: pr.amount,
          method: pr.methodHint || 'cash',
          status: 'success',
          paidAt: new Date(),
          confirmedBy: BigInt(userId || 1),
          confirmedAt: new Date()
        }
      });
      
      if (evidenceUrl) {
        await tx.evidence.create({
          data: {
            refType: 'Payment',
            refId: payment.paymentId,
            fileUrl: evidenceUrl,
            uploadedBy: BigInt(userId || 1)
          }
        });
      }

      if (pr.paymentType === 'deposit' || pr.paymentType === 'DEPOSIT') {
        await tx.order.update({
          where: { orderId: pr.orderId },
          data: { status: 'deposit_paid' },
        });
      }
    });
  }
}

export const paymentService = new PaymentService();
