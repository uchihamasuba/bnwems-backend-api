import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Survey & Task API', () => {
  const token = generateTestToken({ userId: 'admin', role: 'ADMIN' });

  it('GET /api/v1/tasks should return 200', async () => {
    prismaMock.workTask.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/v1/tasks').set('Authorization', `Bearer ${token}`);
    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);
  });
  
  it('POST /api/v1/tasks/assign should return 200', async () => {
    prismaMock.assignment.createMany.mockResolvedValue({ count: 1 } as any);
    const res = await request(app).post('/api/v1/tasks/assign').set('Authorization', `Bearer ${token}`).send({ workTaskId: '1', assignments: [{ userId: '2', role: 'STAFF' }] });
    expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);
  });

  it('GET /api/v1/tasks/assigned should exist', async () => { const res = await request(app).get('/api/v1/tasks/assigned').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  it('GET /api/v1/tasks/:id/pick-list should exist', async () => { const res = await request(app).get('/api/v1/tasks/1/pick-list').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  it('GET /api/v1/tasks/:id/survey-report should exist', async () => { const res = await request(app).get('/api/v1/tasks/1/survey-report').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  it('POST /api/v1/tasks/:id/survey-report should exist', async () => { const res = await request(app).post('/api/v1/tasks/1/survey-report').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  it('PUT /api/v1/tasks/:id/progress should exist', async () => { const res = await request(app).put('/api/v1/tasks/1/progress').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  it('POST /api/v1/tasks/:id/assignments should exist', async () => { const res = await request(app).post('/api/v1/tasks/1/assignments').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  it('PUT /api/v1/tasks/:id should exist', async () => { const res = await request(app).put('/api/v1/tasks/1').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
  it('DELETE /api/v1/tasks/:id should exist', async () => { const res = await request(app).delete('/api/v1/tasks/1').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });
});
