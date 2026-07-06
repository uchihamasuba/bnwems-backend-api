import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';
import {
  OrderStatus,
  PaymentStatus,
  OrderItemSource,
  DepositStatus,
  SettlementStatus,
} from '@prisma/client';

describe('Order API (Module 8)', () => {
  const adminToken = generateTestToken({ userId: '1', role: 'ADMIN' });
  const validId1 = '1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/orders', () => {
    it('should return list of orders', async () => {
      prismaMock.order.findMany.mockResolvedValue([{ orderId: 1n, orderCode: 'ORD-123' } as any]);
      prismaMock.order.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/orders', () => {
    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should create new order successfully', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      prismaMock.$transaction.mockImplementation(async (cb: any) => {
        return cb(prismaMock);
      });
      prismaMock.order.create.mockResolvedValue({ orderId: 1n, orderCode: 'ORD' } as any);

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: 1,
          eventType: 'WEDDING',
          eventDate: futureDate.toISOString(),
          location: '123 Test St',
          items: [{ itemId: 1, quantity: 10, unitPrice: 100, source: OrderItemSource.INTERNAL }],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    it('should return 404 if not found', async () => {
      prismaMock.order.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/v1/orders/${validId1}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should return order', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ orderId: 1n, customerId: 2n } as any);

      const res = await request(app)
        .get(`/api/v1/orders/${validId1}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/orders/:id/status', () => {
    it('should update order status successfully', async () => {
      prismaMock.$transaction.mockImplementation(async (cb: any) => {
        return cb(prismaMock);
      });
      prismaMock.order.findUnique.mockResolvedValue({ orderId: 1n } as any);
      prismaMock.order.update.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/orders/${validId1}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ orderStatus: OrderStatus.CONFIRMED });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/orders/:id/items', () => {
    it('should update order items successfully', async () => {
      prismaMock.$transaction.mockImplementation(async (cb: any) => {
        return cb(prismaMock);
      });
      prismaMock.order.findUnique.mockResolvedValue({ orderId: 1n } as any);

      const res = await request(app)
        .put(`/api/v1/orders/${validId1}/items`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          items: [{ itemId: 1, quantity: 20, unitPrice: 100 }],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/orders/:id/warnings', () => {
    it('should get order warnings', async () => {
      prismaMock.orderWarning.findMany.mockResolvedValue([{ warningId: 1n }] as any);

      const res = await request(app)
        .get(`/api/v1/orders/${validId1}/warnings`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/orders/:id/warnings', () => {
    it('should create order warning', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ orderId: 1n } as any);
      prismaMock.orderWarning.create.mockResolvedValue({ warningId: 1n } as any);

      const res = await request(app)
        .post(`/api/v1/orders/${validId1}/warnings`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ content: 'Warning content' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/warnings/:id/resolve', () => {
    it('should resolve order warning', async () => {
      prismaMock.orderWarning.findUnique.mockResolvedValue({ warningId: 1n } as any);
      prismaMock.orderWarning.update.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/warnings/${validId1}/resolve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/orders/:id/deposits', () => {
    it('should get order deposits', async () => {
      prismaMock.deposit.findMany.mockResolvedValue([{ depositId: 1n }] as any);

      const res = await request(app)
        .get(`/api/v1/orders/${validId1}/deposits`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/orders/:id/deposits', () => {
    it('should create deposit', async () => {
      prismaMock.$transaction.mockImplementation(async (cb: any) => {
        return cb(prismaMock);
      });
      prismaMock.order.findUnique.mockResolvedValue({ orderId: 1n } as any);
      prismaMock.deposit.create.mockResolvedValue({ depositId: 1n } as any);

      const res = await request(app)
        .post(`/api/v1/orders/${validId1}/deposits`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 1000 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/deposits/:id', () => {
    it('should update deposit status', async () => {
      prismaMock.$transaction.mockImplementation(async (cb: any) => {
        return cb(prismaMock);
      });
      prismaMock.deposit.findUnique.mockResolvedValue({ depositId: 1n, orderId: 1n } as any);
      prismaMock.deposit.update.mockResolvedValue({} as any);
      prismaMock.order.update.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/deposits/${validId1}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: DepositStatus.SUCCESS });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/orders/:id/settlement', () => {
    it('should get settlement', async () => {
      prismaMock.settlement.findFirst.mockResolvedValue({ settlementId: 1n } as any);

      const res = await request(app)
        .get(`/api/v1/orders/${validId1}/settlement`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/orders/:id/settlement', () => {
    it('should create settlement', async () => {
      prismaMock.$transaction.mockImplementation(async (cb: any) => {
        return cb(prismaMock);
      });
      prismaMock.order.findUnique.mockResolvedValue({ orderId: 1n, totalAmount: 10000 } as any);
      prismaMock.deposit.aggregate.mockResolvedValue({ _sum: { amount: 1000 } } as any);
      prismaMock.settlement.create.mockResolvedValue({ settlementId: 1n } as any);

      const res = await request(app)
        .post(`/api/v1/orders/${validId1}/settlement`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ additionalFee: 0, compensation: 0, discount: 0 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/settlements/:id/confirm', () => {
    it('should confirm settlement', async () => {
      prismaMock.$transaction.mockImplementation(async (cb: any) => {
        return cb(prismaMock);
      });
      prismaMock.settlement.findUnique.mockResolvedValue({ settlementId: 1n, orderId: 1n } as any);
      prismaMock.settlement.update.mockResolvedValue({} as any);
      prismaMock.order.update.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/settlements/${validId1}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: SettlementStatus.CONFIRMED });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
  describe('PUT /api/v1/orders/:id/prepare', () => {
    it('should update preparation for an order', async () => {
      const res = await request(app)
        .put(`/api/v1/orders/${validId1}/prepare`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/orders/:id/checkout', () => {
    it('should checkout an order', async () => {
      const res = await request(app)
        .post(`/api/v1/orders/${validId1}/checkout`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
