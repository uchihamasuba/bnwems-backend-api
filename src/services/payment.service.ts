import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export class PaymentService {
  static async createQrCode(paymentId: string) {
    const payment = await prisma.payment.findUnique({ where: { id: BigInt(paymentId) } });
    if (!payment) throw new AppError('Payment not found', 404);

    // In a real system, we'd call VNPay API here to generate a payment URL/QR code
    // Mocking it for now
    const transactionRef = `VNP${Date.now()}`;
    await prisma.payment.update({
      where: { id: BigInt(paymentId) },
      data: { transactionRef }
    });

    return {
      payment_id: Number(payment.id),
      qr_url: `https://sandbox.vnpayment.vn/mock?ref=${transactionRef}`,
      transaction_ref: transactionRef
    };
  }

  static async vnpayCallback(data: any) {
    const { vnp_TxnRef, vnp_ResponseCode, vnp_SecureHash } = data;
    // In a real system we would verify vnp_SecureHash using VNPay secret key
    
    if (vnp_ResponseCode === '00') {
      await prisma.payment.updateMany({
        where: { transactionRef: vnp_TxnRef },
        data: { status: 'confirmed' }
      });
    } else {
      await prisma.payment.updateMany({
        where: { transactionRef: vnp_TxnRef },
        data: { status: 'failed' }
      });
    }

    return true;
  }

  static async confirmPayment(paymentId: string, decision: string, notes: string, userId: string) {
    if (!['confirmed', 'rejected'].includes(decision)) {
      throw new AppError('Decision must be confirmed or rejected', 400, 'MSG-PE-03');
    }
    if (decision === 'rejected' && !notes) {
      throw new AppError('Must provide reasons for rejection', 400, 'MSG-PE-02');
    }

    const updated = await prisma.payment.update({
      where: { id: BigInt(paymentId) },
      data: { status: decision }
    });

    return {
      id: Number(updated.id),
      status: updated.status,
      confirmed_by: Number(userId)
    };
  }

  static async createPayment(data: any, userId: string) {
    const payment = await prisma.payment.create({
      data: {
        orderId: BigInt(data.order_id),
        paymentType: data.payment_type || 'other',
        amount: data.amount,
        paymentMethod: data.payment_method || 'transfer',
        paymentDate: new Date(),
        status: 'confirmed',
        confirmedBy: BigInt(userId),
        confirmedAt: new Date(),
        createdBy: BigInt(userId)
      }
    });

    return {
      id: Number(payment.id),
      status: payment.status
    };
  }

  static async uploadEvidence(id: string, evidenceFileIds: number[], userId: string) {
    // In actual implementation we would update evidence attachments mapping
    // But since this is mock we just return success
    return {
      payment_id: Number(id),
      status: 'pending' // Still pending until confirmed by manager
    };
  }

  static async getPaymentsByOrder(orderId: string) {
    const payments = await prisma.payment.findMany({
      where: { orderId: BigInt(orderId) }
    });
    return payments.map(p => ({
      id: Number(p.id),
      payment_type: p.paymentType,
      amount: Number(p.amount),
      status: p.status,
      created_at: p.createdAt
    }));
  }
}