import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class SupplierTxService {
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
          catalogItemId: BigInt(item.catalogItemId),
          quantity: item.quantity,
          unitCost: item.unitPrice,
        }
      });
    }

    return newTx;
  }

  public async receiveSupplierItems(id: string, evidenceUrls: string[], userId: string) {
    const tx = await prisma.supplierTransaction.findUnique({ where: { supplierTransactionId: BigInt(id) } });
    if (!tx) throw new AppError('Transaction not found', 404);

    await prisma.$transaction(async (prismaTx) => {
      await prismaTx.supplierTransaction.update({
        where: { supplierTransactionId: BigInt(id) },
        data: {
          status: 'completed',
        },
      });

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

      // BR-16-04: Creates or updates SupplierDebt automatically
      const existingDebt = await prismaTx.supplierDebt.findFirst({
        where: { supplierId: tx.supplierId, status: { in: ['open', 'partial'] } },
      });

      if (existingDebt) {
        await prismaTx.supplierDebt.update({
          where: { debtId: existingDebt.debtId },
          data: {
            amount: Number(existingDebt.amount) + Number(tx.totalCost),
            status: 'open',
          },
        });
      } else {
        await prismaTx.supplierDebt.create({
          data: {
            supplierId: tx.supplierId,
            supplierTransactionId: tx.supplierTransactionId,
            amount: tx.totalCost,
            paidAmount: 0,
            status: 'open',
          },
        });
      }
    });
  }

  public async returnSupplierItems(id: string, evidenceUrls: string[], userId: string) {
    await prisma.supplierTransaction.update({
      where: { supplierTransactionId: BigInt(id) },
      data: {
        status: 'returned',
      },
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

  public async getSupplierDebts(page: number, limit: number, status?: string, supplierId?: string) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (supplierId) whereClause.supplierId = BigInt(supplierId);

    const [debts, totalCount] = await Promise.all([
      prisma.supplierDebt.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.supplierDebt.count({ where: whereClause }),
    ]);

    return { debts, totalCount };
  }

  public async paySupplierDebt(id: string, amount: number) {
    const debt = await prisma.supplierDebt.findUnique({ where: { debtId: BigInt(id) } });
    if (!debt) throw new AppError('Debt not found', 404);

    const remaining = Number(debt.amount) - Number(debt.paidAmount);
    if (amount > remaining) {
      throw new AppError('Payment amount exceeds remaining debt.', 400, 'MSG-UC16-05');
    }

    const newPaid = Number(debt.paidAmount) + amount;
    const newStatus = newPaid >= Number(debt.amount) ? 'paid' : 'partial';

    await prisma.supplierDebt.update({
      where: { debtId: BigInt(id) },
      data: {
        paidAmount: newPaid,
        status: newStatus,
      },
    });
  }
}

export const supplierTxService = new SupplierTxService();
