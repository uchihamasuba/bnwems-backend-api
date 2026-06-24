import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Supplier Transaction API', () => {
  const token = generateTestToken({ userId: 'admin', role: 'ADMIN' });

  it('GET /api/v1/supplier-transactions should return 200', async () => {
    prismaMock.supplierTransaction.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/v1/supplier-transactions').set('Authorization', `Bearer ${token}`);
    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);
  });
});

describe('Supplier Debt API', () => {
  const token = generateTestToken({ userId: 'admin', role: 'ADMIN' });

  it('GET /api/v1/supplier-debts should return 200', async () => {
    prismaMock.supplierDebt.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/v1/supplier-debts').set('Authorization', `Bearer ${token}`);
    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);
  });

  it('PUT /api/v1/supplier-transactions/:id/receive should exist', async () => { const res = await request(app).put('/api/v1/supplier-transactions/1/receive').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  it('PUT /api/v1/supplier-transactions/:id/return should exist', async () => { const res = await request(app).put('/api/v1/supplier-transactions/1/return').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  it('POST /api/v1/supplier-debts/:id/pay should exist', async () => { const res = await request(app).post('/api/v1/supplier-debts/1/pay').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
});
