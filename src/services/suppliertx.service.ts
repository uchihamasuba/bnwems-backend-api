import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class SupplierTxService {
  public async getSupplierTransactions(page: number, limit: number, supplierId?: string, orderId?: string, status?: string) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (supplierId) whereClause.supplierId = BigInt(supplierId);
    if (orderId) whereClause.orderId = BigInt(orderId);
    if (status) whereClause.status = status;

    const [transactions, totalCount] = await Promise.all([
      prisma.supplierTransaction.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.supplierTransaction.count({ where: whereClause }),
    ]);

    return { transactions, totalCount };
  }

  public async getSupplierTransactionById(id: string) {
    const tx = await prisma.supplierTransaction.findUnique({
      where: { supplierTransactionId: BigInt(id) }
    });
    if (!tx) throw new AppError('Không tìm thấy giao dịch.', 404);

    const items = await prisma.supplierTransactionItem.findMany({
      where: { supplierTransactionId: BigInt(id) }
    });

    return {
      ...tx,
      items
    };
  }

  public async createSupplierTransaction(data: any, userId: string) {
    const { supplierId, orderId, transactionType, totalCost, items } = data;

    const newTx = await prisma.supplierTransaction.create({
      data: {
        supplierId: BigInt(supplierId),
        ...(orderId && { orderId: BigInt(orderId) }),
        type: transactionType,
        totalCost,
        status: 'pending',
        createdBy: BigInt(userId)
      },
    });

    for (const item of items) {
      await prisma.supplierTransactionItem.create({
        data: {
          supplierTransactionId: newTx.supplierTransactionId,
          equipmentItemId: BigInt(item.equipmentItemId),
          quantity: item.quantity,
          unitCost: item.unitPrice,
        }
      });
    }

    return newTx;
  }

  public async receiveSupplierItems(id: string, items: any[], evidenceUrls: string[], userId: string) {
    const tx = await prisma.supplierTransaction.findUnique({ where: { supplierTransactionId: BigInt(id) } });
    if (!tx) throw new AppError('Không tìm thấy giao dịch.', 404);

    await prisma.$transaction(async (prismaTx) => {
      await prismaTx.supplierTransaction.update({
        where: { supplierTransactionId: BigInt(id) },
        data: {
          status: 'completed',
        },
      });

      if (items && Array.isArray(items)) {
        for (const item of items) {
          await prismaTx.supplierTransactionItem.updateMany({
            where: { supplierTransactionId: BigInt(id), equipmentItemId: BigInt(item.equipmentItemId) },
            data: { quantityReceived: item.quantityReceived }
          });
        }
      }

      if (evidenceUrls && Array.isArray(evidenceUrls)) {
        await Promise.all(evidenceUrls.map(url => prismaTx.evidence.create({
          data: {
            refType: 'SupplierTransaction',
            refId: BigInt(id),
            fileUrl: url,
            uploadedBy: BigInt(userId)
          }
        })));
      }

      // BR-16-04: Creates or updates SupplierDebt automatically - REMOVED in new schema
    });
  }

  public async returnSupplierItems(id: string, items: any[], evidenceUrls: string[], userId: string) {
    await prisma.$transaction(async (prismaTx) => {
      await prismaTx.supplierTransaction.update({
        where: { supplierTransactionId: BigInt(id) },
        data: {
          status: 'returned',
        },
      });

      if (items && Array.isArray(items)) {
        for (const item of items) {
          await prismaTx.supplierTransactionItem.updateMany({
            where: { supplierTransactionId: BigInt(id), equipmentItemId: BigInt(item.equipmentItemId) },
            data: { quantityReturned: item.quantityReturned }
          });
        }
      }

      if (evidenceUrls && Array.isArray(evidenceUrls)) {
        await Promise.all(evidenceUrls.map(url => prismaTx.evidence.create({
          data: {
            refType: 'SupplierTransaction',
            refId: BigInt(id),
            fileUrl: url,
            uploadedBy: BigInt(userId)
          }
        })));
      }
    });
  }

  public async updateSupplierTxStatus(id: string, status: string, evidenceUrls: string[], userId: string) {
    await prisma.supplierTransaction.update({
      where: { supplierTransactionId: BigInt(id) },
      data: { status },
    });

    if (evidenceUrls && Array.isArray(evidenceUrls)) {
      await Promise.all(evidenceUrls.map(url => prisma.evidence.create({
        data: {
          refType: 'SupplierTransaction',
          refId: BigInt(id),
          fileUrl: url,
          uploadedBy: BigInt(userId)
        }
      })));
    }
  }

  public async paySupplierTransaction(id: string, amount: number, paymentRef: string, userId: string) {
    await prisma.$transaction(async (prismaTx) => {
      const tx = await prismaTx.supplierTransaction.findUnique({
        where: { supplierTransactionId: BigInt(id) }
      });
      if (!tx) throw new AppError('Không tìm thấy giao dịch nhà cung cấp.', 404);

      await prismaTx.supplierPayment.create({
        data: {
          supplierTransactionId: BigInt(id),
          amount,
          paidAt: new Date(),
          recordedBy: BigInt(userId),
          note: paymentRef
        }
      });

      const newPaidAmount = tx.paidAmount.toNumber() + amount;
      const totalCost = tx.totalCost.toNumber();
      let paymentStatus = 'partial';
      if (newPaidAmount >= totalCost) paymentStatus = 'paid';

      await prismaTx.supplierTransaction.update({
        where: { supplierTransactionId: BigInt(id) },
        data: {
          paidAmount: newPaidAmount,
          paymentStatus
        }
      });
    });
  }
}

export const supplierTxService = new SupplierTxService();
