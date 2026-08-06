import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { SupplierStatus, TransactionStatus, PaymentStatus, TransactionType } from '@prisma/client';

class SupplierService {
  // ============================================================================
  // SUPPLIER
  // ============================================================================

  public async getSuppliers(page: number, limit: number, search?: string, status?: SupplierStatus) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { supplierCode: { contains: search } },
        { supplierName: { contains: search } },
      ];
    }
    if (status) {
      whereClause.status = status;
    }

    const [suppliers, totalCount] = await Promise.all([
      prisma.supplier.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.supplier.count({ where: whereClause }),
    ]);

    return { suppliers, totalCount };
  }

  public async createSupplier(data: any, actionUserId: string) {
    const existing = await prisma.supplier.findUnique({
      where: { supplierCode: data.supplierCode },
    });
    if (existing) {
      throw new AppError('Mã nhà cung cấp đã tồn tại', 400);
    }

    return await prisma.supplier.create({
      data: {
        supplierCode: data.supplierCode,
        supplierName: data.supplierName,
        serviceType: data.serviceType,
        contactPerson: data.contactPerson,
        phone: data.phone,
        email: data.email,
        address: data.address,
        rating: data.rating,
        notes: data.notes,
        createdBy: BigInt(actionUserId),
      },
    });
  }

  public async updateSupplier(id: string, data: any) {
    const existing = await prisma.supplier.findUnique({ where: { supplierId: BigInt(id) } });
    if (!existing) throw new AppError('Không tìm thấy nhà cung cấp', 404);

    return await prisma.supplier.update({
      where: { supplierId: BigInt(id) },
      data,
    });
  }

  // ============================================================================
  // SUPPLIER TRANSACTIONS
  // ============================================================================

  public async createSupplierTransaction(data: any, actionUserId: string) {
    const { supplierId, orderId, transactionType, serviceTitle, depositAmount, items } = data;

    let estimatedCost = 0;
    const transactionItems = items.map((i: any) => {
      estimatedCost += i.unitCost * i.quantity;
      return {
        itemId: i.itemId ? BigInt(i.itemId) : null,
        itemName: i.itemName,
        quantity: i.quantity,
        unitCost: i.unitCost,
        notes: i.notes,
      };
    });

    const transactionCode = 'STX-' + Date.now();

    return await prisma.supplierTransaction.create({
      data: {
        transactionCode,
        supplierId: BigInt(supplierId),
        orderId: BigInt(orderId),
        transactionType,
        serviceTitle,
        estimatedCost,
        depositAmount: depositAmount || 0,
        status: TransactionStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
        createdBy: BigInt(actionUserId),
        items: {
          create: transactionItems,
        },
      },
    });
  }

  public async getSupplierTransactions(
    page: number,
    limit: number,
    supplierId?: string,
    paymentStatus?: PaymentStatus,
    status?: TransactionStatus,
  ) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (supplierId) whereClause.supplierId = BigInt(supplierId);
    if (paymentStatus) whereClause.paymentStatus = paymentStatus;
    if (status) whereClause.status = status;

    const [transactions, totalCount] = await Promise.all([
      prisma.supplierTransaction.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: { select: { supplierName: true } },
        },
      }),
      prisma.supplierTransaction.count({ where: whereClause }),
    ]);

    const formattedTransactions = transactions.map((t) => ({
      ...t,
      supplierName: t.supplier?.supplierName,
    }));

    return { transactions: formattedTransactions, totalCount };
  }

  public async getSupplierTransactionById(id: string) {
    const transaction = await prisma.supplierTransaction.findUnique({
      where: { transactionId: BigInt(id) },
      include: {
        supplier: { select: { supplierName: true } },
        items: true,
      },
    });
    if (!transaction) throw new AppError('Không tìm thấy giao dịch', 404);

    return {
      ...transaction,
      supplierName: transaction.supplier?.supplierName,
    };
  }

  public async updateSupplierTransactionStatus(
    id: string,
    status: TransactionStatus,
    notes?: string,
    actionUserId?: string,
  ) {
    const transaction = await prisma.supplierTransaction.findUnique({
      where: { transactionId: BigInt(id) },
    });
    if (!transaction) throw new AppError('Không tìm thấy giao dịch', 404);

    return await prisma.supplierTransaction.update({
      where: { transactionId: BigInt(id) },
      data: { status, notes },
    });
  }

  public async updateSupplierTransactionPaymentStatus(id: string, paymentStatus: PaymentStatus) {
    const transaction = await prisma.supplierTransaction.findUnique({
      where: { transactionId: BigInt(id) },
    });
    if (!transaction) throw new AppError('Không tìm thấy giao dịch', 404);

    return await prisma.supplierTransaction.update({
      where: { transactionId: BigInt(id) },
      data: { paymentStatus },
    });
  }

  public async receiveSupplierTransaction(id: string, itemsData: any[]) {
    const transaction = await prisma.supplierTransaction.findUnique({
      where: { transactionId: BigInt(id) },
    });
    if (!transaction) throw new AppError('Không tìm thấy giao dịch', 404);

    await prisma.$transaction(async (tx) => {
      for (const item of itemsData) {
        await tx.supplierTransactionItem.update({
          where: { stItemId: BigInt(item.stItemId) },
          data: { receivedQuantity: item.receivedQuantity },
        });
      }
    });

    return { success: true };
  }
}

export const supplierService = new SupplierService();
