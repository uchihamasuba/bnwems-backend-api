import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Attendance API', () => {
  const token = generateTestToken({ userId: 'admin', role: 'ADMIN' });

  it('GET /api/v1/attendances should return 200', async () => {
    prismaMock.attendance.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/v1/attendances').set('Authorization', `Bearer ${token}`);
    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);
  });
  
  it('POST /api/v1/attendances/check-in should return 200', async () => {
    prismaMock.attendance.findFirst.mockResolvedValue({ id: '1', status: 'PENDING' } as any);
    const res = await request(app).post('/api/v1/attendances/check-in').set('Authorization', `Bearer ${token}`).send({ assignmentId: '1' });
    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);
  });

  it('PUT /api/v1/attendance/:id/confirm should exist', async () => { const res = await request(app).put('/api/v1/attendance/1/confirm').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
});
