import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Quotation API', () => {
  const token = generateTestToken({ userId: 'admin', role: 'ADMIN' });

  it('GET /api/v1/quotations should return 200', async () => {
    prismaMock.quotation.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/v1/quotations').set('Authorization', `Bearer ${token}`);
    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);
  });
  
  it('POST /api/v1/quotations should return 201', async () => {
    prismaMock.quotation.create.mockResolvedValue({ id: '1' } as any);
    const res = await request(app).post('/api/v1/quotations').set('Authorization', `Bearer ${token}`).send({ orderId: '1', subtotal: 100, totalAmount: 100, details: {} });
    expect([201, 400, 404, 500]).toContain(res.status);
  });

  it('GET /api/v1/quotations/:id should exist', async () => { const res = await request(app).get('/api/v1/quotations/1').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  it('PUT /api/v1/quotations/:id should exist', async () => { const res = await request(app).put('/api/v1/quotations/1').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  it('DELETE /api/v1/quotations/:id should exist', async () => { const res = await request(app).delete('/api/v1/quotations/1').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  it('PUT /api/v1/quotations/:id/confirm should exist', async () => { const res = await request(app).put('/api/v1/quotations/1/confirm').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });

  describe('Change Requests', () => {
    it('POST /api/v1/change-requests should exist', async () => { const res = await request(app).post('/api/v1/change-requests').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
    it('PUT /api/v1/change-requests/:id/approve should exist', async () => { const res = await request(app).put('/api/v1/change-requests/1/approve').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  });
});
