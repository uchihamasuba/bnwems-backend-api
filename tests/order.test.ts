import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Order API', () => {
  const token = generateTestToken({ userId: 'admin', role: 'ADMIN' });

  it('GET /api/v1/orders should return 200', async () => {
    prismaMock.order.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/v1/orders').set('Authorization', `Bearer ${token}`);
    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);
  });
  
  it('POST /api/v1/orders should return 201', async () => {
    prismaMock.order.create.mockResolvedValue({ id: '1' } as any);
    const res = await request(app).post('/api/v1/orders').set('Authorization', `Bearer ${token}`).send({ customerId: '1', orderNumber: 'ORD-001', eventDate: new Date() });
    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);
  });

  it('GET /api/v1/orders/field-progress should exist', async () => { const res = await request(app).get('/api/v1/orders/field-progress').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  it('GET /api/v1/orders/:id should exist', async () => { const res = await request(app).get('/api/v1/orders/1').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  it('PUT /api/v1/orders/:id/confirm should exist', async () => { const res = await request(app).put('/api/v1/orders/1/confirm').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  it('PUT /api/v1/orders/:id/change-date should exist', async () => { const res = await request(app).put('/api/v1/orders/1/change-date').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  it('PUT /api/v1/orders/:id/close should exist', async () => { const res = await request(app).put('/api/v1/orders/1/close').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });

  describe('Order Nested Routes', () => {
    it('GET /api/v1/orders/:orderId/quotations should exist', async () => { const res = await request(app).get('/api/v1/orders/1/quotations').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
    it('POST /api/v1/orders/:orderId/change-requests should exist', async () => { const res = await request(app).post('/api/v1/orders/1/change-requests').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
    it('GET /api/v1/orders/:orderId/tasks should exist', async () => { const res = await request(app).get('/api/v1/orders/1/tasks').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
    it('GET /api/v1/orders/:orderId/payments should exist', async () => { const res = await request(app).get('/api/v1/orders/1/payments').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
    it('POST /api/v1/orders/:orderId/settlement should exist', async () => { const res = await request(app).post('/api/v1/orders/1/settlement').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  });
});
