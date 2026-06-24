import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class SupplierTxService {
  public async createSupplierTransaction(data: any) {
    const { supplierId, orderId, transactionType, totalCost, details } = data;

    const newTx = await prisma.supplierTransaction.create({
      data: {
        supplierId,
        orderId,
        transactionType,
        totalCost,
        details,
        status: 'DRAFT',
      },
    });

    return newTx;
  }

  public async receiveSupplierItems(id: string, evidenceUrls: string[], userId: string) {
    const tx = await prisma.supplierTransaction.findUnique({ where: { id } });
    if (!tx) throw new AppError('Transaction not found', 404);

    await prisma.$transaction(async (prismaTx) => {
      await prismaTx.supplierTransaction.update({
        where: { id },
        data: {
          status: 'RECEIVED',
          evidences: evidenceUrls && Array.isArray(evidenceUrls) ? {
            create: evidenceUrls.map(url => ({
              fileUrl: url,
              evidenceType: 'OTHER',
              uploadedBy: userId,
            })),
          } : undefined,
        },
      });

      // BR-16-04: Creates or updates SupplierDebt automatically
      const existingDebt = await prismaTx.supplierDebt.findFirst({
        where: { supplierId: tx.supplierId, status: { in: ['UNPAID', 'PARTIALLY_PAID'] } },
      });

      if (existingDebt) {
        await prismaTx.supplierDebt.update({
          where: { id: existingDebt.id },
          data: {
            amountOwed: existingDebt.amountOwed + tx.totalCost,
            status: 'UNPAID',
          },
        });
      } else {
        await prismaTx.supplierDebt.create({
          data: {
            supplierId: tx.supplierId,
            amountOwed: tx.totalCost,
            amountPaid: 0,
            status: 'UNPAID',
          },
        });
      }
    });
  }

  public async returnSupplierItems(id: string, evidenceUrls: string[], userId: string) {
    await prisma.supplierTransaction.update({
      where: { id },
      data: {
        status: 'RETURNED',
        evidences: evidenceUrls && Array.isArray(evidenceUrls) ? {
          create: evidenceUrls.map(url => ({
            fileUrl: url,
            evidenceType: 'OTHER',
            uploadedBy: userId,
          })),
        } : undefined,
      },
    });
  }

  public async getSupplierDebts(page: number, limit: number, status?: string, supplierId?: string) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (supplierId) whereClause.supplierId = supplierId;

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
    const debt = await prisma.supplierDebt.findUnique({ where: { id } });
    if (!debt) throw new AppError('Debt not found', 404);

    const remaining = debt.amountOwed - debt.amountPaid;
    if (amount > remaining) {
      throw new AppError('Payment amount exceeds remaining debt.', 400, 'MSG-UC16-05');
    }

    const newPaid = debt.amountPaid + amount;
    const newStatus = newPaid >= debt.amountOwed ? 'PAID' : 'PARTIALLY_PAID';

    await prisma.supplierDebt.update({
      where: { id },
      data: {
        amountPaid: newPaid,
        status: newStatus,
      },
    });
  }
}

export const supplierTxService = new SupplierTxService();
