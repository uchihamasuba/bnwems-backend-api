/**
 * @file order.test.ts
 * Unit tests for Order Service — order creation, quotation management.
 */

jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: {
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    quotation: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    customer: { findUnique: jest.fn() },
  },
}));

import { orderService } from '../src/services/order.service';
import prisma from '../src/config/database';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('OrderService — createOrder()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should throw 400 when eventDate is in the past', async () => {
    await expect(
      orderService.createOrder({
        customerId: 1,
        eventDate: '2020-01-01T00:00:00Z', // Past date
        eventLocation: 'Test Hall',
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('should create order with auto-generated orderCode', async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    (mockPrisma.order.count as jest.Mock).mockResolvedValue(87);
    (mockPrisma.order.create as jest.Mock).mockResolvedValue({
      id: 88,
      orderCode: 'ORD-2026-0088',
      status: 'DRAFT',
      customerId: 1,
      eventDate: futureDate,
      eventLocation: 'Alpha Event Hall',
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await orderService.createOrder({
      customerId: 1,
      eventDate: futureDate.toISOString(),
      eventLocation: 'Alpha Event Hall',
    });

    expect(result.orderCode).toBe('ORD-2026-0088');
    expect(result.status).toBe('DRAFT');
  });
});

describe('OrderService — getOrders()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return paginated orders with customer relation', async () => {
    const mockOrders = [
      {
        id: 88,
        orderCode: 'ORD-2026-0088',
        status: 'WAITING_FOR_DEPOSIT',
        eventDate: new Date(),
        eventLocation: 'Alpha Hall',
        customer: { fullName: 'Test Customer', phone: '0901234567' },
      },
    ];

    (mockPrisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders);
    (mockPrisma.order.count as jest.Mock).mockResolvedValue(1);

    const result = await orderService.getOrders({ status: 'WAITING_FOR_DEPOSIT', page: 1 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].orderCode).toBe('ORD-2026-0088');
    expect(result.pagination.totalItems).toBe(1);
  });
});
