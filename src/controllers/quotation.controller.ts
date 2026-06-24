import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getQuotationsByOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [quotations, totalCount] = await Promise.all([
      prisma.quotation.findMany({
        where: { orderId },
        skip,
        take: limit,
        orderBy: { version: 'desc' },
      }),
      prisma.quotation.count({ where: { orderId } }),
    ]);

    res.status(200).json({
      success: true,
      data: quotations,
      meta: { page, limit, totalCount },
    });
  } catch (error) {
    next(error);
  }
};

export const getQuotationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const quotation = await prisma.quotation.findUnique({ where: { id } });

    if (!quotation) return next(new AppError('Quotation not found.', 404));

    res.status(200).json({
      success: true,
      data: quotation,
    });
  } catch (error) {
    next(error);
  }
};

export const createQuotation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const { subtotal, tax, discount, totalAmount, details } = req.body;

    if (subtotal === undefined || totalAmount === undefined) {
      return next(new AppError('Required information is missing.', 400, 'MSG-UC10-01'));
    }

    const latestQuote = await prisma.quotation.findFirst({
      where: { orderId },
      orderBy: { version: 'desc' },
    });

    const version = latestQuote ? latestQuote.version + 1 : 1;

    const newQuote = await prisma.quotation.create({
      data: {
        orderId,
        version,
        subtotal,
        tax: tax || 0,
        discount: discount || 0,
        totalAmount,
        details,
        status: 'DRAFT',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'CREATE_QUOTATION',
        entityType: 'Quotation',
        entityId: newQuote.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Quotation created.',
      data: { id: newQuote.id, version: newQuote.version },
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuotation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { subtotal, tax, discount, totalAmount, details } = req.body;

    const existing = await prisma.quotation.findUnique({ where: { id } });
    if (!existing) return next(new AppError('Quotation not found.', 404));

    if (existing.status === 'ACCEPTED' || existing.status === 'SENT') {
      return next(new AppError('Cannot modify after confirmation.', 400, 'MSG-UC10-04'));
    }

    await prisma.quotation.update({
      where: { id },
      data: { subtotal, tax, discount, totalAmount, details },
    });

    res.status(200).json({
      success: true,
      message: 'Quotation updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuotation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await prisma.quotation.findUnique({ where: { id } });
    if (!existing) return next(new AppError('Quotation not found.', 404));

    if (existing.status === 'ACCEPTED') {
      return next(new AppError('Cannot delete accepted quotation.', 400, 'MSG-UC10-05'));
    }

    await prisma.quotation.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Quotation deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const confirmQuotation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const quote = await prisma.quotation.findUnique({ where: { id } });
    if (!quote) return next(new AppError('Quotation not found.', 404));

    await prisma.$transaction([
      prisma.quotation.update({ where: { id }, data: { status: 'ACCEPTED' } }),
      prisma.order.update({ where: { id: quote.orderId }, data: { status: 'QUOTED' } }),
    ]);

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'CONFIRM_QUOTATION',
        entityType: 'Quotation',
        entityId: id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Quotation confirmed.',
      data: { status: 'ACCEPTED' },
    });
  } catch (error) {
    next(error);
  }
};
