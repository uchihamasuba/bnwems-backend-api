import prisma from '../config/database';

export const paymentService = {
  async generateQr(payload: { orderId: number; amount: number; paymentType: string }) {
    const paymentReference = `PAY-ORD${payload.orderId}-${payload.paymentType}`;

    // In production, integrate with VNPay/VietQR API here
    const qrCodeString = `00020101021238580010A00000072701240006970422${payload.orderId}${payload.amount}`;
    const qrImageUrl = `https://api.vietqr.io/image/bnwems-${paymentReference}.jpg`;

    const payment = await prisma.payment.create({
      data: {
        orderId: payload.orderId,
        paymentType: payload.paymentType as 'DEPOSIT' | 'FINAL_SETTLEMENT',
        amount: payload.amount,
        paymentReference,
        qrCodeString,
        qrImageUrl,
        status: 'PENDING',
      },
    });

    return {
      qrCodeString: payment.qrCodeString,
      qrImageUrl: payment.qrImageUrl,
      paymentReference: payment.paymentReference,
    };
  },

  async submitEvidence(payload: {
    orderId: number;
    evidenceImageUrl: string;
    transactionAmount: number;
    submittedByUserId: number;
  }) {
    const payment = await prisma.payment.findFirst({
      where: { orderId: payload.orderId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });

    if (!payment) {
      const err: Error & { statusCode?: number } = new Error(
        'Không tìm thấy giao dịch thanh toán đang chờ xử lý.'
      );
      err.statusCode = 404;
      throw err;
    }

    const evidence = await prisma.paymentEvidence.create({
      data: {
        paymentId: payment.id,
        evidenceImageUrl: payload.evidenceImageUrl,
        transactionAmount: payload.transactionAmount,
        submittedByUserId: payload.submittedByUserId,
      },
    });

    return evidence;
  },
};
