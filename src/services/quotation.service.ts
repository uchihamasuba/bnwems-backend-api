import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class QuotationService {
  public async getQuotationsByOrder(orderId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [quotations, totalCount] = await Promise.all([
      prisma.quotation.findMany({
        where: orderId ? { orderId } : undefined,
        skip,
        take: limit,
        orderBy: { version: 'desc' },
      }),
      prisma.quotation.count({ where: orderId ? { orderId } : undefined }),
    ]);

    return { quotations, totalCount };
  }

  public async getQuotationById(id: string) {
    const quotation = await prisma.quotation.findUnique({ where: { id } });
    if (!quotation) throw new AppError('Quotation not found.', 404);
    return quotation;
  }

  public async createQuotation(orderId: string, data: any, actionUserId: string) {
    const { subtotal, tax, discount, totalAmount, details } = data;

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
        userId: actionUserId,
        action: 'CREATE_QUOTATION',
        entityType: 'Quotation',
        entityId: newQuote.id,
      },
    });

    return newQuote;
  }

  public async updateQuotation(id: string, data: any) {
    const { subtotal, tax, discount, totalAmount, details } = data;

    const existing = await prisma.quotation.findUnique({ where: { id } });
    if (!existing) throw new AppError('Quotation not found.', 404);

    if (existing.status === 'ACCEPTED' || existing.status === 'SENT') {
      throw new AppError('Cannot modify after confirmation.', 400, 'MSG-UC10-04');
    }

    await prisma.quotation.update({
      where: { id },
      data: { subtotal, tax, discount, totalAmount, details },
    });
  }

  public async deleteQuotation(id: string) {
    const existing = await prisma.quotation.findUnique({ where: { id } });
    if (!existing) throw new AppError('Quotation not found.', 404);

    if (existing.status === 'ACCEPTED') {
      throw new AppError('Cannot delete accepted quotation.', 400, 'MSG-UC10-05');
    }

    await prisma.quotation.delete({ where: { id } });
  }

  public async confirmQuotation(id: string, actionUserId: string) {
    const quote = await prisma.quotation.findUnique({ where: { id } });
    if (!quote) throw new AppError('Quotation not found.', 404);

    await prisma.$transaction([
      prisma.quotation.update({ where: { id }, data: { status: 'ACCEPTED' } }),
      prisma.order.update({ where: { id: quote.orderId }, data: { status: 'QUOTED' } }),
    ]);

    await prisma.auditLog.create({
      data: {
        userId: actionUserId,
        action: 'CONFIRM_QUOTATION',
        entityType: 'Quotation',
        entityId: id,
      },
    });
  }
}

export const quotationService = new QuotationService();
