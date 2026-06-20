import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export class QuotationService {
  static async getQuotationsByOrder(orderId: string) {
    const quotations = await prisma.quotation.findMany({
      where: { orderId: BigInt(orderId) },
      include: { lines: true },
      orderBy: { version: 'desc' }
    });
    return quotations.map(q => ({
      ...q,
      id: Number(q.id),
      orderId: Number(q.orderId),
      createdBy: Number(q.createdBy),
      totalAmount: Number(q.totalAmount),
      discountAmount: Number(q.discountAmount),
      finalAmount: Number(q.finalAmount),
      lines: q.lines.map(l => ({ ...l, id: Number(l.id), quotationId: Number(l.quotationId), catalogItemId: Number(l.catalogItemId), quantity: Number(l.quantity), unitPrice: Number(l.unitPrice), totalPrice: Number(l.totalPrice) }))
    }));
  }

  static async getQuotationById(id: string) {
    const q = await prisma.quotation.findUnique({
      where: { id: BigInt(id) },
      include: { lines: true }
    });
    if (!q) throw new AppError('Quotation not found', 404);
    return {
      ...q,
      id: Number(q.id),
      orderId: Number(q.orderId),
      createdBy: Number(q.createdBy),
      totalAmount: Number(q.totalAmount),
      discountAmount: Number(q.discountAmount),
      finalAmount: Number(q.finalAmount),
      lines: q.lines.map(l => ({ ...l, id: Number(l.id), quotationId: Number(l.quotationId), catalogItemId: Number(l.catalogItemId), quantity: Number(l.quantity), unitPrice: Number(l.unitPrice), totalPrice: Number(l.totalPrice) }))
    };
  }

  static async createQuotation(orderId: string, data: any, userId: string) {
    const order = await prisma.order.findUnique({ where: { id: BigInt(orderId) } });
    if (!order) throw new AppError('Order not found', 404, 'MSG-QT-03');

    if (!data.lines || data.lines.length === 0) {
      throw new AppError('Quotation must have lines', 400, 'MSG-QT-02');
    }

    // Check catalog items
    let totalAmount = 0;
    const linesToCreate = [];
    for (const line of data.lines) {
      const item = await prisma.catalogItem.findUnique({ where: { id: BigInt(line.catalog_item_id) } });
      if (!item) throw new AppError('Catalog item not found', 404, 'MSG-QT-03');
      if (item.status !== 'active') throw new AppError('Catalog item inactive', 409, 'MSG-QT-04');

      const quantity = Number(line.quantity);
      const unitPrice = Number(line.unit_price);
      const totalPrice = quantity * unitPrice;
      totalAmount += totalPrice;

      linesToCreate.push({
        catalogItemId: item.id,
        itemName: item.name,
        quantity,
        unitPrice,
        totalPrice
      });
    }

    const discountAmount = Number(data.discount_amount || 0);
    const finalAmount = totalAmount - discountAmount;

    // Get current version
    const existingQuotation = await prisma.quotation.findFirst({
      where: { orderId: BigInt(orderId) },
      orderBy: { version: 'desc' }
    });
    const nextVersion = existingQuotation ? existingQuotation.version + 1 : 1;

    const quotation = await prisma.quotation.create({
      data: {
        orderId: BigInt(orderId),
        version: nextVersion,
        totalAmount,
        discountAmount,
        finalAmount,
        notes: data.notes,
        status: 'draft',
        createdBy: BigInt(userId),
        lines: {
          create: linesToCreate
        }
      },
      include: { lines: true }
    });

    await prisma.auditLog.create({
      data: {
        userId: BigInt(userId),
        action: 'CREATE_QUOTATION',
        entityType: 'quotations',
        entityId: quotation.id
      }
    });

    return {
      id: Number(quotation.id),
      order_id: Number(quotation.orderId),
      version: quotation.version,
      total_amount: Number(quotation.totalAmount),
      discount_amount: Number(quotation.discountAmount),
      final_amount: Number(quotation.finalAmount),
      status: quotation.status
    };
  }

  static async updateQuotation(id: string, data: any, userId: string) {
    const oldQuotation = await prisma.quotation.findUnique({
      where: { id: BigInt(id) },
      include: { order: true, lines: true }
    });
    if (!oldQuotation) throw new AppError('Quotation not found', 404);

    if (oldQuotation.order.status === 'confirmed') {
      throw new AppError('Order already confirmed, quotation locked', 409, 'MSG-UQ-02');
    }

    let totalAmount = 0;
    const linesToCreate = [];
    for (const line of data.lines) {
      const item = await prisma.catalogItem.findUnique({ where: { id: BigInt(line.catalog_item_id) } });
      if (!item) throw new AppError('Catalog item not found', 404);
      if (item.status !== 'active') throw new AppError('Catalog item inactive', 409, 'MSG-UQ-03');

      const quantity = Number(line.quantity);
      const unitPrice = Number(line.unit_price);
      const totalPrice = quantity * unitPrice;
      totalAmount += totalPrice;

      linesToCreate.push({
        catalogItemId: item.id,
        itemName: item.name,
        quantity,
        unitPrice,
        totalPrice
      });
    }

    const discountAmount = Number(data.discount_amount || 0);
    if (discountAmount > totalAmount) {
      throw new AppError('Discount exceeds total', 400, 'MSG-UQ-04');
    }
    const finalAmount = totalAmount - discountAmount;

    // Supersede old quotation
    await prisma.quotation.update({
      where: { id: BigInt(id) },
      data: { status: 'superseded' }
    });

    // Create new version
    const newQuotation = await prisma.quotation.create({
      data: {
        orderId: oldQuotation.orderId,
        version: oldQuotation.version + 1,
        totalAmount,
        discountAmount,
        finalAmount,
        notes: data.notes,
        status: 'draft',
        createdBy: BigInt(userId),
        lines: { create: linesToCreate }
      }
    });

    return {
      id: Number(newQuotation.id),
      order_id: Number(newQuotation.orderId),
      version: newQuotation.version,
      final_amount: Number(newQuotation.finalAmount),
      status: newQuotation.status
    };
  }

  static async approveQuotation(id: string) {
    const q = await prisma.quotation.findUnique({ where: { id: BigInt(id) }, include: { order: true } });
    if (!q) throw new AppError('Quotation not found', 404);

    if (q.status === 'superseded') {
      throw new AppError('Quotation is superseded', 409, 'MSG-CQ-02');
    }
    if (q.order.status === 'confirmed') {
      throw new AppError('Order already confirmed', 409, 'MSG-CQ-03');
    }

    const updated = await prisma.quotation.update({
      where: { id: BigInt(id) },
      data: { status: 'approved', approvedAt: new Date() }
    });

    return {
      id: Number(updated.id),
      status: updated.status,
      approved_at: updated.approvedAt
    };
  }
}