import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Task API (Module 8)', () => {
  const adminToken = generateTestToken({ userId: 'admin', role: 'ADMIN' });
  const staffToken = generateTestToken({ userId: 'staff1', role: 'LEADER_STAFF' });
  const validUUID1 = '123e4567-e89b-12d3-a456-426614174000';
  const validUUID2 = '123e4567-e89b-12d3-a456-426614174001';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/orders/:orderId/tasks', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).post(`/api/v1/orders/${validUUID1}/tasks`);
      expect(res.status).toBe(401);
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post(`/api/v1/orders/${validUUID1}/tasks`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          taskType: '', // invalid
        });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should create task successfully', async () => {
      prismaMock.workTask.create.mockResolvedValue({ id: validUUID2 } as any);

      const res = await request(app)
        .post(`/api/v1/orders/${validUUID1}/tasks`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          taskType: 'SETUP',
          scheduledStart: new Date().toISOString(),
          scheduledEnd: new Date().toISOString(),
          location: 'Main Hall'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(prismaMock.workTask.create).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/tasks', () => {
    it('should return list of tasks', async () => {
      prismaMock.workTask.findMany.mockResolvedValue([
        { id: validUUID2, taskType: 'SETUP' } as any
      ]);
      prismaMock.workTask.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/v1/tasks/assigned', () => {
    it('should return list of assigned tasks', async () => {
      prismaMock.workTask.findMany.mockResolvedValue([
        { id: validUUID2, taskType: 'SETUP' } as any
      ]);

      const res = await request(app)
        .get('/api/v1/tasks/assigned')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/v1/tasks/:id/pick-list', () => {
    it('should return 404 if task not found', async () => {
      prismaMock.workTask.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/v1/tasks/${validUUID2}/pick-list`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should return pick list items', async () => {
      prismaMock.workTask.findUnique.mockResolvedValue({
        id: validUUID2,
        order: {
          quotations: [{ details: { items: [{ itemId: 'item1', qty: 10 }] } }]
        }
      } as any);

      const res = await request(app)
        .get(`/api/v1/tasks/${validUUID2}/pick-list`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/tasks/:id/survey-report', () => {
    it('should return 400 if already submitted (MSG-UC12-01)', async () => {
      prismaMock.workTask.findUnique.mockResolvedValue({
        id: validUUID2,
        evidences: [{ id: 'ev1' }] // Already has evidences
      } as any);

      const res = await request(app)
        .post(`/api/v1/tasks/${validUUID2}/survey-report`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          evidences: [{ fileUrl: 'http://example.com/photo.jpg' }]
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UC12-01');
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post(`/api/v1/tasks/${validUUID2}/survey-report`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          evidences: [] // Must include at least one photo evidence
        });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should record survey report successfully', async () => {
      prismaMock.workTask.findUnique.mockResolvedValue({
        id: validUUID2,
        evidences: []
      } as any);
      prismaMock.workTask.update.mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/v1/tasks/${validUUID2}/survey-report`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          evidences: [{ fileUrl: 'http://example.com/photo.jpg' }]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(prismaMock.workTask.update).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/tasks/:id/survey-report', () => {
    it('should return 404 if not found', async () => {
      prismaMock.workTask.findUnique.mockResolvedValue(null);
      const res = await request(app)
        .get(`/api/v1/tasks/${validUUID2}/survey-report`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });

    it('should return survey report', async () => {
      prismaMock.workTask.findUnique.mockResolvedValue({
        id: validUUID2,
        evidences: [{ id: 'ev1' }]
      } as any);
      const res = await request(app)
        .get(`/api/v1/tasks/${validUUID2}/survey-report`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.taskId).toBe(validUUID2);
    });
  });

  describe('PUT /api/v1/tasks/:id/progress', () => {
    it('should return 400 for invalid status (MSG-UC25-01)', async () => {
      prismaMock.workTask.findUnique.mockResolvedValue({ id: validUUID2, status: 'PENDING' } as any);

      const res = await request(app)
        .put(`/api/v1/tasks/${validUUID2}/progress`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UC25-01');
    });

    it('should update progress successfully', async () => {
      prismaMock.workTask.findUnique.mockResolvedValue({ id: validUUID2, status: 'PENDING' } as any);
      prismaMock.workTask.update.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/tasks/${validUUID2}/progress`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'IN_PROGRESS' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/tasks/:id', () => {
    it('should return 400 if task is already started', async () => {
      prismaMock.workTask.findUnique.mockResolvedValue({ id: validUUID2, status: 'IN_PROGRESS' } as any);

      const res = await request(app)
        .put(`/api/v1/tasks/${validUUID2}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ location: 'New Location' });

      expect(res.status).toBe(400);
    });

    it('should update task successfully', async () => {
      prismaMock.workTask.findUnique.mockResolvedValue({ id: validUUID2, status: 'PENDING' } as any);
      prismaMock.workTask.update.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/tasks/${validUUID2}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ location: 'New Location' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    it('should return 400 if task is already started (MSG-UC55-06)', async () => {
      prismaMock.workTask.findUnique.mockResolvedValue({ id: validUUID2, status: 'IN_PROGRESS' } as any);

      const res = await request(app)
        .delete(`/api/v1/tasks/${validUUID2}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UC55-06');
    });

    it('should delete task successfully', async () => {
      prismaMock.workTask.findUnique.mockResolvedValue({ id: validUUID2, status: 'PENDING' } as any);
      prismaMock.workTask.delete.mockResolvedValue({} as any);

      const res = await request(app)
        .delete(`/api/v1/tasks/${validUUID2}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/tasks/:id/assignments', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).post(`/api/v1/tasks/${validUUID2}/assignments`);
      expect(res.status).toBe(401);
    });

    // NOTE: assignment API testing can be expanded, but ensuring it is mounted correctly
    it('should call assignment creation', async () => {
      // Mocking validate input which triggers assignmentController.assignStaff
      // For coverage of assignment
      prismaMock.workTask.findUnique.mockResolvedValue({ id: validUUID2, status: 'PENDING' } as any);
      prismaMock.user.findMany.mockResolvedValue([{ id: validUUID1 }] as any);
      prismaMock.$transaction.mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/v1/tasks/${validUUID2}/assignments`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ assignments: [{ userId: validUUID1, assignedRole: 'MEMBER' }] });

      expect([200, 201]).toContain(res.status);
    });
  });
});
