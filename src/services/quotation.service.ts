import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class QuotationService {
  public async getQuotationsByOrder(orderId: string, page: number, limit: number) {
    const quotations = await prisma.quotation.findMany({
      where: { orderId: BigInt(orderId) },
      orderBy: { version: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    const mapped = quotations.map(q => ({
      ...q,
      subtotal: q.subtotal,
      tax: q.tax,
      discount: q.discount,
      totalAmount: q.totalAmount
    }));

    const totalCount = await prisma.quotation.count({ where: { orderId: BigInt(orderId) } });

    return { quotations: mapped, totalCount };
  }

  public async getQuotationById(id: string) {
    const quotation = await prisma.quotation.findUnique({ 
      where: { quotationId: BigInt(id) },
    });
    if (!quotation) throw new AppError('Không tìm thấy báo giá.', 404);
    
    const items = await prisma.quotationItem.findMany({
      where: { quotationId: BigInt(id) }
    });
    
    return {
      ...quotation,
      subtotal: quotation.subtotal,
      tax: quotation.tax,
      discount: quotation.discount,
      items
    };
  }

  public async createQuotation(orderId: string, data: any, actionUserId: string) {
    const { totalAmount, items } = data;

    const order = await prisma.order.findUnique({ where: { orderId: BigInt(orderId) } });
    if (!order) throw new AppError('Không tìm thấy đơn hàng.', 404);

    const latestQuote = await prisma.quotation.findFirst({ 
      where: { orderId: BigInt(orderId) },
      orderBy: { version: 'desc' }
    });

    const newVersion = latestQuote ? latestQuote.version + 1 : 1;

    let quote: any;
    await prisma.$transaction(async (prismaTx) => {
      quote = await prismaTx.quotation.create({
        data: {
          orderId: BigInt(orderId),
          customerId: order.customerId,
          subtotal: data.subtotal || totalAmount,
          tax: data.tax || 0,
          discount: data.discount || 0,
          totalAmount,
          version: newVersion,
          status: 'draft',
          createdBy: BigInt(actionUserId),
        },
      });

      if (items && items.length > 0) {
        await prismaTx.quotationItem.createMany({
          data: items.map((item: any) => ({
            quotationId: quote.quotationId,
            equipmentItemId: BigInt(item.equipmentItemId),
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
        entityId: quote.quotationId,
      },
    });

    return quote;
  }

  public async updateQuotation(id: string, data: any) {
    const { totalAmount, items } = data;

    const existing = await prisma.quotation.findUnique({ where: { quotationId: BigInt(id) } });
    if (!existing) throw new AppError('Không tìm thấy báo giá.', 404);

    if (existing.status === 'confirmed' || existing.status === 'SENT') {
      throw new AppError('Không thể chỉnh sửa sau khi đã xác nhận.', 400, 'MSG-UC10-04');
    }

    await prisma.$transaction(async (prismaTx) => {
      await prismaTx.quotation.update({
        where: { quotationId: BigInt(id) },
        data: { 
          subtotal: data.subtotal || totalAmount,
          tax: data.tax || 0,
          discount: data.discount || 0,
          totalAmount 
        },
      });
      
      if (items) {
        await prismaTx.quotationItem.deleteMany({ where: { quotationId: BigInt(id) } });
        await prismaTx.quotationItem.createMany({
          data: items.map((item: any) => ({
            quotationId: BigInt(id),
            equipmentItemId: BigInt(item.equipmentItemId),
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
    if (!existing) throw new AppError('Không tìm thấy báo giá.', 404);

    if (existing.status === 'confirmed') {
      throw new AppError('Không thể xóa báo giá đã được chấp nhận.', 400, 'MSG-UC10-05');
    }

    await prisma.$transaction(async (prismaTx) => {
      await prismaTx.quotationItem.deleteMany({ where: { quotationId: BigInt(id) } });
      await prismaTx.quotation.delete({ where: { quotationId: BigInt(id) } });
    });
  }

  public async confirmQuotation(id: string, actionUserId: string) {
    const quote = await prisma.quotation.findUnique({ where: { quotationId: BigInt(id) } });
    if (!quote) throw new AppError('Không tìm thấy báo giá.', 404);

    await prisma.$transaction([
      prisma.quotation.update({ where: { quotationId: BigInt(id) }, data: { status: 'confirmed' } }),
      prisma.order.update({ where: { orderId: quote.orderId }, data: { status: 'confirmed' } }),
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

  public async updateQuotationStatus(id: string, status: string, actionUserId: string) {
    const quote = await prisma.quotation.findUnique({ where: { quotationId: BigInt(id) } });
    if (!quote) throw new AppError('Không tìm thấy báo giá.', 404);

    await prisma.quotation.update({ where: { quotationId: BigInt(id) }, data: { status } });

    await prisma.auditLog.create({
      data: {
        userId: BigInt(actionUserId),
        action: 'UPDATE_QUOTATION_STATUS',
        entityType: 'Quotation',
        entityId: BigInt(id),
      },
    });
  }
}

export const quotationService = new QuotationService();
