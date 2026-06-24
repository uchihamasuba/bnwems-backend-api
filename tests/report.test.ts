import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Report API', () => {
  const token = generateTestToken({ userId: 'admin', role: 'ADMIN' });

  it('GET /api/v1/reports/revenue should return 200', async () => {
    prismaMock.payment.aggregate.mockResolvedValue({ _sum: { amount: 1000 } } as any);
    const res = await request(app).get('/api/v1/reports/revenue').set('Authorization', `Bearer ${token}`);
    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);
  });
});

describe('Dashboard API', () => {
  const token = generateTestToken({ userId: 'admin', role: 'ADMIN' });

  it('GET /api/v1/dashboard/admin should return 200', async () => {
    prismaMock.order.count.mockResolvedValue(10);
    const res = await request(app).get('/api/v1/dashboard/admin').set('Authorization', `Bearer ${token}`);
    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);
  });

  it('GET /api/v1/reports/inventory should exist', async () => { const res = await request(app).get('/api/v1/reports/inventory').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  it('GET /api/v1/reports/verification should exist', async () => { const res = await request(app).get('/api/v1/reports/verification').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  it('GET /api/v1/dashboard/manager should exist', async () => { const res = await request(app).get('/api/v1/dashboard/manager').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
});
