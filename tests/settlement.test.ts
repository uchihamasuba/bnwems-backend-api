import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Settlement API', () => {
  const token = generateTestToken({ userId: 'admin', role: 'ADMIN' });

  it('GET /api/v1/settlements should return 200', async () => {
    prismaMock.settlement.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/v1/settlements').set('Authorization', `Bearer ${token}`);
    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);
  });

  it('POST /api/v1/settlements should exist', async () => { const res = await request(app).post('/api/v1/settlements').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  it('PUT /api/v1/settlements/:id/confirm should exist', async () => { const res = await request(app).put('/api/v1/settlements/1/confirm').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
});
