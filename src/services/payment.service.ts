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
    return payments.map(p => ({
      ...p,
      paymentId: p.paymentId.toString(),
      paymentRequestId: p.paymentRequestId?.toString(),
      orderId: p.orderId.toString(),
      confirmedBy: p.confirmedBy?.toString()
    }));
  }

  public async getPaymentRequestById(id: string) {
    const pr = await prisma.paymentRequest.findUnique({
      where: { paymentRequestId: BigInt(id) }
    });
    
    if (!pr) throw new AppError('Không tìm thấy yêu cầu thanh toán.', 404);
    
    const payments = await prisma.payment.findMany({
      where: { paymentRequestId: BigInt(id) }
    });
    
    return {
      ...pr,
      paymentRequestId: pr.paymentRequestId.toString(),
      orderId: pr.orderId.toString(),
      createdBy: pr.createdBy?.toString(),
      payments: payments.map(p => ({
        ...p,
        paymentId: p.paymentId.toString(),
        paymentRequestId: p.paymentRequestId?.toString(),
        orderId: p.orderId.toString(),
        confirmedBy: p.confirmedBy?.toString()
      }))
    };
  }

  public async requestPayment(finalOrderId: string, amount: number, paymentType: string, paymentMethod: string, userId: string) {
    if (!finalOrderId || !amount || !paymentType || !paymentMethod) {
      throw new AppError('Thiếu thông tin bắt buộc.', 400, 'MSG-UC19-01');
    }

    const order = await prisma.order.findUnique({
      where: { orderId: BigInt(finalOrderId) }
    });

    if (!order) throw new AppError('Không tìm thấy đơn hàng.', 404);

    const quote = await prisma.quotation.findFirst({
      where: { orderId: BigInt(finalOrderId) },
      orderBy: { version: 'desc' }
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
    const isCompleted = status.toLowerCase() === 'completed';
    const isFailed = status.toLowerCase() === 'failed';

    if (!isCompleted && !isFailed) {
      throw new AppError('Trạng thái phải là hoàn thành hoặc thất bại.', 400);
    }

    const pr = await prisma.paymentRequest.findUnique({ where: { paymentRequestId: BigInt(id) } });
    if (!pr) throw new AppError('Không tìm thấy yêu cầu thanh toán.', 404);

    await prisma.$transaction(async (tx) => {
      if (isCompleted) {
        await tx.paymentRequest.update({
          where: { paymentRequestId: BigInt(id) },
          data: { status: 'paid' },
        });
      }

      const payment = await tx.payment.create({
        data: {
          paymentRequestId: BigInt(id),
          orderId: pr.orderId,
          amount: pr.amount,
          method: pr.methodHint || 'cash',
          status: isCompleted ? 'success' : 'failed',
          paidAt: isCompleted ? new Date() : null,
          confirmedBy: BigInt(userId || 1),
          confirmedAt: new Date()
        }
      });
      
      if (evidenceUrl) {
        await tx.evidence.create({
          data: {
            refType: 'Payment',
            refId: payment.paymentId,
            orderId: pr.orderId,
            fileUrl: evidenceUrl,
            uploadedBy: BigInt(userId || 1)
          }
        });
      }

      if (isCompleted && (pr.paymentType === 'deposit' || pr.paymentType === 'DEPOSIT')) {
        await tx.order.update({
          where: { orderId: pr.orderId },
          data: { status: 'deposit_paid' },
        });
      }
    });
  }
}

export const paymentService = new PaymentService();
