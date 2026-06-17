import prisma from '../config/database';

export interface CreateOrderPayload {
  customerId: number;
  eventDate: string;
  eventLocation: string;
  notes?: string;
}

export interface GetOrdersQuery {
  status?: string;
  page?: number;
}

export const orderService = {
  async getOrders(query: GetOrdersQuery) {
    const page = query.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: { select: { fullName: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      pagination: { totalItems: total, totalPages: Math.ceil(total / limit), currentPage: page, limit },
      data: orders,
    };
  },

  async getOrderById(id: number) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        quotations: {
          include: {
            quotationItems: {
              include: { equipment: { select: { sku: true, equipmentName: true } } },
            },
          },
        },
      },
    });

    if (!order) {
      const err: Error & { statusCode?: number } = new Error('Đơn hàng không tồn tại trên hệ thống.');
      err.statusCode = 404;
      throw err;
    }

    return order;
  },

  async createOrder(payload: CreateOrderPayload) {
    const eventDate = new Date(payload.eventDate);
    if (isNaN(eventDate.getTime()) || eventDate < new Date()) {
      const err: Error & { statusCode?: number } = new Error(
        'Ngày sự kiện không hợp lệ hoặc nằm trong quá khứ (MSG-CO02).'
      );
      err.statusCode = 400;
      throw err;
    }

    const count = await prisma.order.count();
    const orderCode = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const order = await prisma.order.create({
      data: {
        orderCode,
        customerId: payload.customerId,
        eventDate,
        eventLocation: payload.eventLocation,
        notes: payload.notes,
        status: 'DRAFT',
      },
    });

    return order;
  },

  async createQuotation(
    orderId: number,
    payload: {
      items: { equipmentId: number; quantity: number; unitPrice: number }[];
      depositAmount: number;
      notes?: string;
    }
  ) {
    const totalAmount = payload.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

    const quotation = await prisma.quotation.create({
      data: {
        orderId,
        totalAmount,
        depositAmount: payload.depositAmount,
        notes: payload.notes,
        status: 'DRAFT',
        quotationItems: {
          create: payload.items.map((item) => ({
            equipmentId: item.equipmentId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
          })),
        },
      },
    });

    return { quotationId: quotation.id };
  },

  async confirmQuotation(quotationId: number) {
    await prisma.quotation.update({
      where: { id: quotationId },
      data: { status: 'CONFIRMED' },
    });

    // Update order status
    const quotation = await prisma.quotation.findUnique({ where: { id: quotationId } });
    if (quotation) {
      await prisma.order.update({
        where: { id: quotation.orderId },
        data: { status: 'WAITING_FOR_DEPOSIT' },
      });
    }
  },
};
