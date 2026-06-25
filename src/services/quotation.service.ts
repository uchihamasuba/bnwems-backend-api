import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class QuotationService {
  public async getQuotationsByOrder(orderId: string, page: number, limit: number) {
    const quotation = await prisma.quotation.findUnique({
      where: { orderId: BigInt(orderId) },
    });
    
    // API compatibility: return as array
    const quotations = quotation ? [{
      ...quotation,
      version: 1,
      subtotal: quotation.totalAmount,
      tax: 0,
      discount: 0
    }] : [];

    return { quotations, totalCount: quotations.length };
  }

  public async getQuotationById(id: string) {
    const quotation = await prisma.quotation.findUnique({ 
      where: { quotationId: BigInt(id) },
    });
    if (!quotation) throw new AppError('Quotation not found.', 404);
    
    const items = await prisma.quotationItem.findMany({
      where: { quotationId: BigInt(id) }
    });
    
    return {
      ...quotation,
      version: 1,
      subtotal: quotation.totalAmount,
      tax: 0,
      discount: 0,
      items
    };
  }

  public async createQuotation(orderId: string, data: any, actionUserId: string) {
    const { totalAmount, items } = data;

    const order = await prisma.order.findUnique({ where: { orderId: BigInt(orderId) } });
    if (!order) throw new AppError('Order not found', 404);

    let quote = await prisma.quotation.findUnique({ where: { orderId: BigInt(orderId) } });

    await prisma.$transaction(async (prismaTx) => {
      if (quote) {
        quote = await prismaTx.quotation.update({
          where: { quotationId: quote.quotationId },
          data: { totalAmount }
        });
        await prismaTx.quotationItem.deleteMany({ where: { quotationId: quote.quotationId } });
      } else {
        quote = await prismaTx.quotation.create({
          data: {
            orderId: BigInt(orderId),
            customerId: order.customerId,
            totalAmount,
            status: 'draft',
            createdBy: BigInt(actionUserId),
          },
        });
      }

      if (items && items.length > 0) {
        await prismaTx.quotationItem.createMany({
          data: items.map((item: any) => ({
            quotationId: quote!.quotationId,
            catalogItemId: BigInt(item.catalogItemId),
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.quantity * item.unitPrice
          }))
        });
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: BigInt(actionUserId),
        action: 'CREATE_QUOTATION',
        entityType: 'Quotation',
        entityId: quote!.quotationId,
      },
    });

    return quote!;
  }

  public async updateQuotation(id: string, data: any) {
    const { totalAmount, items } = data;

    const existing = await prisma.quotation.findUnique({ where: { quotationId: BigInt(id) } });
    if (!existing) throw new AppError('Quotation not found.', 404);

    if (existing.status === 'confirmed' || existing.status === 'SENT') {
      throw new AppError('Cannot modify after confirmation.', 400, 'MSG-UC10-04');
    }

    await prisma.$transaction(async (prismaTx) => {
      await prismaTx.quotation.update({
        where: { quotationId: BigInt(id) },
        data: { totalAmount },
      });
      
      if (items) {
        await prismaTx.quotationItem.deleteMany({ where: { quotationId: BigInt(id) } });
        await prismaTx.quotationItem.createMany({
          data: items.map((item: any) => ({
            quotationId: BigInt(id),
            catalogItemId: BigInt(item.catalogItemId),
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.quantity * item.unitPrice
          }))
        });
      }
    });
  }

  public async deleteQuotation(id: string) {
    const existing = await prisma.quotation.findUnique({ where: { quotationId: BigInt(id) } });
    if (!existing) throw new AppError('Quotation not found.', 404);

    if (existing.status === 'confirmed') {
      throw new AppError('Cannot delete accepted quotation.', 400, 'MSG-UC10-05');
    }

    await prisma.$transaction(async (prismaTx) => {
      await prismaTx.quotationItem.deleteMany({ where: { quotationId: BigInt(id) } });
      await prismaTx.quotation.delete({ where: { quotationId: BigInt(id) } });
    });
  }

  public async confirmQuotation(id: string, actionUserId: string) {
    const quote = await prisma.quotation.findUnique({ where: { quotationId: BigInt(id) } });
    if (!quote) throw new AppError('Quotation not found.', 404);

    await prisma.$transaction([
      prisma.quotation.update({ where: { quotationId: BigInt(id) }, data: { status: 'confirmed' } }),
      prisma.order.update({ where: { orderId: quote.orderId }, data: { status: 'QUOTED' } }),
    ]);

    await prisma.auditLog.create({
      data: {
        userId: BigInt(actionUserId),
        action: 'CONFIRM_QUOTATION',
        entityType: 'Quotation',
        entityId: BigInt(id),
      },
    });
  }
}

export const quotationService = new QuotationService();
