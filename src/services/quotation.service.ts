import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { QuotationStatus } from '@prisma/client';

class QuotationService {
  public async getCustomerQuotations(customerId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [quotations, totalCount] = await Promise.all([
      prisma.quotation.findMany({
        where: { customerId: BigInt(customerId) },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.quotation.count({ where: { customerId: BigInt(customerId) } }),
    ]);

    return { quotations, totalCount };
  }

  public async getQuotationById(id: string) {
    const quotation = await prisma.quotation.findUnique({
      where: { quotationId: BigInt(id) },
      include: {
        items: true,
      },
    });
    if (!quotation) throw new AppError('Không tìm thấy báo giá.', 404);

    return quotation;
  }

  private async prepareQuotationItems(itemsData: any[]) {
    let subtotal = 0;
    let discountTotal = 0;
    const itemIds = itemsData.map((i) => BigInt(i.itemId));
    const itemsInfo = await prisma.item.findMany({
      where: { itemId: { in: itemIds } },
      select: { itemId: true, itemName: true },
    });
    const itemMap = new Map(itemsInfo.map((i) => [i.itemId.toString(), i.itemName]));

    const quotationItems = itemsData.map((i: any) => {
      const discount = i.discount || 0;
      const lineTotal = i.price * i.quantity - discount;
      subtotal += i.price * i.quantity;
      discountTotal += discount;

      return {
        itemId: BigInt(i.itemId),
        itemName: itemMap.get(i.itemId.toString()) || 'Unknown Item',
        quantity: i.quantity,
        price: i.price,
        discount: discount,
      };
    });

    const totalAmount = subtotal - discountTotal;
    return { subtotal, discountTotal, totalAmount, quotationItems };
  }

  public async createQuotation(customerId: string, data: any, actionUserId: string) {
    const { version, notes, items } = data;

    const { subtotal, discountTotal, totalAmount, quotationItems } =
      await this.prepareQuotationItems(items);
    const quotationCode = 'QUO-' + Date.now();

    return await prisma.quotation.create({
      data: {
        quotationCode,
        customerId: BigInt(customerId),
        version,
        subtotal,
        discountTotal,
        totalAmount,
        status: QuotationStatus.DRAFT,
        notes,
        createdBy: BigInt(actionUserId),
        items: {
          create: quotationItems,
        },
      },
    });
  }

  public async updateQuotation(id: string, data: any, actionUserId: string) {
    const { notes, items } = data;

    const quotation = await prisma.quotation.findUnique({ where: { quotationId: BigInt(id) } });
    if (!quotation) throw new AppError('Không tìm thấy báo giá.', 404);
    if (
      quotation.status === QuotationStatus.APPROVED ||
      quotation.status === QuotationStatus.REJECTED
    ) {
      throw new AppError(
        'Không thể sửa báo giá sau khi đã được duyệt hoặc từ chối.',
        400,
        'MSG-UC10-04',
      );
    }

    const { subtotal, discountTotal, totalAmount, quotationItems } =
      await this.prepareQuotationItems(items);

    await prisma.$transaction(async (tx) => {
      // Delete old items
      await tx.quotationItem.deleteMany({
        where: { quotationId: BigInt(id) },
      });

      // Update quotation and create new items
      await tx.quotation.update({
        where: { quotationId: BigInt(id) },
        data: {
          subtotal,
          discountTotal,
          totalAmount,
          notes,
          items: {
            create: quotationItems,
          },
        },
      });
    });

    return { success: true };
  }

  public async updateQuotationStatus(id: string, status: QuotationStatus, actionUserId: string) {
    const quotation = await prisma.quotation.findUnique({ where: { quotationId: BigInt(id) } });
    if (!quotation) throw new AppError('Không tìm thấy báo giá.', 404);

    return await prisma.quotation.update({
      where: { quotationId: BigInt(id) },
      data: { status },
    });
  }

  public async deleteQuotation(id: string) {
    const quotation = await prisma.quotation.findUnique({ where: { quotationId: BigInt(id) } });
    if (!quotation) throw new AppError('Không tìm thấy báo giá.', 404);
    if (quotation.status === QuotationStatus.APPROVED) {
      throw new AppError('Không thể xóa báo giá đã được duyệt.', 400);
    }

    await prisma.quotation.delete({
      where: { quotationId: BigInt(id) },
    });

    return { success: true };
  }
}

export const quotationService = new QuotationService();
