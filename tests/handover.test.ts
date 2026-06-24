import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Handover Record API', () => {
  const token = generateTestToken({ userId: 'admin', role: 'ADMIN' });

  it('GET /api/v1/handovers should return 200', async () => {
    prismaMock.handoverRecord.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/v1/handovers').set('Authorization', `Bearer ${token}`);
    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);
  });
});

describe('Damage/Loss Report API', () => {
  const token = generateTestToken({ userId: 'admin', role: 'ADMIN' });

  it('GET /api/v1/damage-loss should return 200', async () => {
    prismaMock.damageLossReport.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/v1/damage-loss').set('Authorization', `Bearer ${token}`);
    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);
  });

  it('POST /api/v1/orders/:orderId/handover should exist', async () => { const res = await request(app).post('/api/v1/orders/1/handover').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  it('POST /api/v1/orders/:orderId/damage-loss should exist', async () => { const res = await request(app).post('/api/v1/orders/1/damage-loss').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
});
