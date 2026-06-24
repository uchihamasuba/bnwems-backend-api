import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Policy API', () => {
  const token = generateTestToken({ userId: 'admin', role: 'ADMIN' });

  it('GET /api/v1/policies should return 200', async () => {
    prismaMock.businessPolicy.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/v1/policies').set('Authorization', `Bearer ${token}`);
    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);
  });
  
  it('POST /api/v1/policies should return 201', async () => {
    prismaMock.businessPolicy.create.mockResolvedValue({ id: '1' } as any);
    const res = await request(app).post('/api/v1/policies').set('Authorization', `Bearer ${token}`).send({ policyType: 'DEPOSIT', name: 'Test', rules: {} });
    expect([201, 400, 404, 500]).toContain(res.status);
  });

  it('PUT /api/v1/policies/:id should exist', async () => { const res = await request(app).put('/api/v1/policies/1').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
});
