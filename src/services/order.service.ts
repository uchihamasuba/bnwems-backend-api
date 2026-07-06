import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { OrderStatus, PaymentStatus, DepositStatus, SettlementStatus } from '@prisma/client';

class OrderService {
  // ============================================================================
  // ORDERS
  // ============================================================================

  public async getOrders(
    page: number,
    limit: number,
    orderStatus?: OrderStatus,
    paymentStatus?: PaymentStatus,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (orderStatus) whereClause.orderStatus = orderStatus;
    if (paymentStatus) whereClause.paymentStatus = paymentStatus;
    if (search) {
      whereClause.OR = [{ orderCode: { contains: search } }, { eventName: { contains: search } }];
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    return { orders, totalCount };
  }

  public async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { orderId: BigInt(id) },
      include: {
        orderItems: {
          include: {
            item: { select: { itemName: true } },
          },
        },
        orderWarnings: true,
        deposits: true,
        settlements: true,
      },
    });
    if (!order) throw new AppError('Không tìm thấy đơn hàng.', 404);

    return order;
  }

  public async createOrder(data: any, actionUserId: string) {
    const {
      customerId,
      quotationId,
      policyId,
      eventName,
      eventType,
      eventDate,
      location,
      guestCount,
      items,
      notes,
    } = data;

    let totalAmount = 0;
    const orderItems = items.map((i: any) => {
      const subtotal = i.quantity * i.unitPrice;
      totalAmount += subtotal;
      return {
        itemId: BigInt(i.itemId),
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        source: i.source,
        notes: i.notes,
      };
    });

    const orderCode = 'ORD-' + Date.now();

    return await prisma.order.create({
      data: {
        orderCode,
        customerId: BigInt(customerId),
        quotationId: quotationId ? BigInt(quotationId) : null,
        policyId: policyId ? BigInt(policyId) : null,
        eventName,
        eventType,
        eventDate: new Date(eventDate),
        location,
        guestCount,
        totalAmount,
        notes,
        createdBy: BigInt(actionUserId),
        orderItems: {
          create: orderItems,
        },
      },
    });
  }

  public async updateOrderStatus(
    id: string,
    orderStatus: OrderStatus,
    cancelReason?: string,
    notes?: string,
  ) {
    const order = await prisma.order.findUnique({ where: { orderId: BigInt(id) } });
    if (!order) throw new AppError('Không tìm thấy đơn hàng.', 404);

    return await prisma.order.update({
      where: { orderId: BigInt(id) },
      data: { orderStatus, cancelReason, notes },
    });
  }

  public async updateOrderItems(id: string, itemsData: any[]) {
    const order = await prisma.order.findUnique({ where: { orderId: BigInt(id) } });
    if (!order) throw new AppError('Không tìm thấy đơn hàng.', 404);

    let totalAmount = 0;
    const orderItems = itemsData.map((i: any) => {
      const subtotal = i.quantity * i.unitPrice;
      totalAmount += subtotal;
      return {
        itemId: BigInt(i.itemId),
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        source: i.source,
        notes: i.notes,
      };
    });

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { orderId: BigInt(id) } });
      await tx.order.update({
        where: { orderId: BigInt(id) },
        data: {
          totalAmount,
          orderItems: {
            create: orderItems,
          },
        },
      });
    });

    return { success: true };
  }

  // ============================================================================
  // ORDER WARNINGS
  // ============================================================================

  public async getOrderWarnings(orderId: string) {
    return await prisma.orderWarning.findMany({
      where: { orderId: BigInt(orderId) },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createOrderWarning(orderId: string, content: string) {
    return await prisma.orderWarning.create({
      data: {
        orderId: BigInt(orderId),
        content,
      },
    });
  }

  public async resolveOrderWarning(warningId: string, actionUserId: string) {
    const warning = await prisma.orderWarning.findUnique({
      where: { warningId: BigInt(warningId) },
    });
    if (!warning) throw new AppError('Không tìm thấy cảnh báo.', 404);

    return await prisma.orderWarning.update({
      where: { warningId: BigInt(warningId) },
      data: {
        isResolved: true,
        resolvedBy: BigInt(actionUserId),
        resolvedAt: new Date(),
      },
    });
  }

  // ============================================================================
  // DEPOSITS
  // ============================================================================

  public async getOrderDeposits(orderId: string) {
    return await prisma.deposit.findMany({
      where: { orderId: BigInt(orderId) },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createOrderDeposit(
    orderId: string,
    amount: number,
    paymentMethod: string | undefined,
    notes: string | undefined,
    actionUserId: string,
  ) {
    const depositCode = 'DEP-' + Date.now();
    return await prisma.deposit.create({
      data: {
        depositCode,
        orderId: BigInt(orderId),
        amount,
        paymentMethod,
        notes,
        status: DepositStatus.PENDING,
        requestedBy: BigInt(actionUserId),
      },
    });
  }

  public async updateDepositStatus(
    depositId: string,
    status: DepositStatus,
    notes: string | undefined,
    actionUserId: string,
  ) {
    const deposit = await prisma.deposit.findUnique({ where: { depositId: BigInt(depositId) } });
    if (!deposit) throw new AppError('Không tìm thấy khoản cọc.', 404);

    let updateData: any = { status, notes };
    if (status === DepositStatus.SUCCESS) {
      updateData.approvedBy = BigInt(actionUserId);
      updateData.approvedAt = new Date();
      updateData.paymentDate = new Date();
    }

    const updatedDeposit = await prisma.deposit.update({
      where: { depositId: BigInt(depositId) },
      data: updateData,
    });

    if (status === DepositStatus.SUCCESS) {
      // Update order payment status
      await prisma.order.update({
        where: { orderId: deposit.orderId },
        data: { paymentStatus: PaymentStatus.DEPOSITED },
      });
    }

    return updatedDeposit;
  }

  // ============================================================================
  // SETTLEMENTS
  // ============================================================================

  public async getOrderSettlement(orderId: string) {
    const settlement = await prisma.settlement.findFirst({
      where: { orderId: BigInt(orderId) },
      orderBy: { settlementId: 'desc' },
    });
    return settlement;
  }

  public async createOrderSettlement(orderId: string, data: any, actionUserId: string) {
    const order = await prisma.order.findUnique({ where: { orderId: BigInt(orderId) } });
    if (!order) throw new AppError('Không tìm thấy đơn hàng.', 404);

    // Sum deposits
    const deposits = await prisma.deposit.aggregate({
      where: { orderId: BigInt(orderId), status: DepositStatus.SUCCESS },
      _sum: { amount: true },
    });
    const depositAmount = deposits._sum.amount || 0;

    const { additionalFee = 0, compensation = 0, discount = 0, paymentMethod, notes } = data;

    // Final amount = totalAmount - depositAmount + additionalFee - compensation - discount
    // Wait, compensation is usually charged to the customer? Or to the supplier?
    // Let's just follow BR-30-01: finalAmount = totalAmount - depositAmount + additionalFee - deductionAmount (discount)
    // Actually:
    // finalAmount = (order.totalAmount + additionalFee + compensation) - depositAmount - discount;
    const baseTotal = Number(order.totalAmount);
    const finalAmount = baseTotal + additionalFee + compensation - Number(depositAmount) - discount;

    return await prisma.settlement.create({
      data: {
        orderId: BigInt(orderId),
        additionalFee,
        compensation,
        discount,
        finalAmount,
        paymentMethod,
        status: SettlementStatus.DRAFT,
        requestedBy: BigInt(actionUserId),
        requestedAt: new Date(),
      },
    });
  }

  public async confirmSettlement(
    settlementId: string,
    status: SettlementStatus,
    notes: string | undefined,
    actionUserId: string,
  ) {
    const settlement = await prisma.settlement.findUnique({
      where: { settlementId: BigInt(settlementId) },
    });
    if (!settlement) throw new AppError('Không tìm thấy quyết toán.', 404);

    let updateData: any = { status };
    if (status === SettlementStatus.CONFIRMED) {
      updateData.confirmedBy = BigInt(actionUserId);
      updateData.confirmedAt = new Date();
      updateData.paidAt = new Date();
    }

    const updatedSettlement = await prisma.settlement.update({
      where: { settlementId: BigInt(settlementId) },
      data: updateData,
    });

    if (status === SettlementStatus.CONFIRMED) {
      await prisma.order.update({
        where: { orderId: settlement.orderId },
        data: { paymentStatus: PaymentStatus.PAID },
      });
    }

    return updatedSettlement;
  }
}

export const orderService = new OrderService();
