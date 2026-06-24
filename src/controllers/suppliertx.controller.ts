import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createSupplierTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { supplierId, orderId, transactionType, totalCost, details } = req.body;

    if (!supplierId || !transactionType || totalCost === undefined || !details) {
      return next(new AppError('Required information is missing', 400, 'MSG-UC16-01'));
    }

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

    res.status(201).json({
      success: true,
      message: 'Supplier transaction created.',
      data: { id: newTx.id, status: newTx.status },
    });
  } catch (error) {
    next(error);
  }
};

export const receiveSupplierItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { receivedItems, evidenceUrls } = req.body;

    const tx = await prisma.supplierTransaction.findUnique({ where: { id } });
    if (!tx) return next(new AppError('Transaction not found', 404));

    await prisma.$transaction(async (prismaTx) => {
      await prismaTx.supplierTransaction.update({
        where: { id },
        data: {
          status: 'RECEIVED',
          evidences: evidenceUrls && Array.isArray(evidenceUrls) ? {
            create: evidenceUrls.map(url => ({
              fileUrl: url,
              evidenceType: 'OTHER',
              uploadedBy: req.user!.userId,
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
            status: 'UNPAID', // reset status due to new debt, simplified
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

    res.status(200).json({
      success: true,
      message: 'Items received and logged.',
    });
  } catch (error) {
    next(error);
  }
};

export const returnSupplierItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { returnedItems, condition, evidenceUrls } = req.body;

    await prisma.supplierTransaction.update({
      where: { id },
      data: {
        status: 'RETURNED',
        evidences: evidenceUrls && Array.isArray(evidenceUrls) ? {
          create: evidenceUrls.map(url => ({
            fileUrl: url,
            evidenceType: 'OTHER',
            uploadedBy: req.user!.userId,
          })),
        } : undefined,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Items returned to supplier successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getSupplierDebts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { status, supplierId } = req.query;

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

    res.status(200).json({
      success: true,
      data: debts,
      meta: { page, limit, totalCount },
    });
  } catch (error) {
    next(error);
  }
};

export const paySupplierDebt = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { amount, paymentRef } = req.body;

    const debt = await prisma.supplierDebt.findUnique({ where: { id } });
    if (!debt) return next(new AppError('Debt not found', 404));

    const remaining = debt.amountOwed - debt.amountPaid;
    if (amount > remaining) {
      return next(new AppError('Payment amount exceeds remaining debt.', 400, 'MSG-UC16-05'));
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

    // In a real scenario, you might want to log the payment reference to a SupplierPayment table.

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully.',
    });
  } catch (error) {
    next(error);
  }
};
