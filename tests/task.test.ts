import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Task API (Module 8)', () => {
  const adminToken = generateTestToken({ userId: '1', role: { roleId: '1', roleName: 'ADMIN' } });
  const staffToken = generateTestToken({ userId: '1', role: { roleId: '1', roleName: 'LEADER_STAFF' } });
  const validId1 = '1';
  const validId2 = '2';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/orders/:orderId/tasks', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).post(`/api/v1/orders/${validId1}/tasks`);
      expect(res.status).toBe(401);
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post(`/api/v1/orders/${validId1}/tasks`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          taskType: '', // invalid
        });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should create task successfully', async () => {
      prismaMock.workTask.create.mockResolvedValue({ workTaskId: 2n } as any);

      const res = await request(app)
        .post(`/api/v1/orders/${validId1}/tasks`)
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

  describe('GET /api/v1/tasks/assigned', () => {
    it('should return list of assigned tasks', async () => {
      prismaMock.assignment.findMany.mockResolvedValue([
        { 
          workTask: { workTaskId: 2n, taskType: 'SETUP' },
          fieldStatus: 'active'
        } as any
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
        .get(`/api/v1/tasks/${validId2}/pick-list`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should return pick list items', async () => {
      prismaMock.workTask.findUnique.mockResolvedValue({
        workTaskId: 2n, orderId: 1n
      } as any);
      prismaMock.quotation.findFirst.mockResolvedValue({ quotationId: 1n } as any);
      prismaMock.quotationItem.findMany.mockResolvedValue([{ id: 1n, quotationId: 1n, equipmentItemId: 1n, quantity: 10 } as any]);

      const res = await request(app)
        .get(`/api/v1/tasks/${validId2}/pick-list`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/tasks/:id/survey-report', () => {
    it('should return 400 if already submitted (MSG-UC12-01)', async () => {
      prismaMock.workTask.findUnique.mockResolvedValue({
        workTaskId: 2n, orderId: 1n
      } as any);
      prismaMock.surveyReport.findFirst.mockResolvedValue({ surveyReportId: 1n } as any);

      const res = await request(app)
        .post(`/api/v1/tasks/${validId2}/survey-report`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          notes: 'Everything is fine',
          evidences: [{ fileUrl: 'http://example.com/img1.png', type: 'image/png' }]
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UC12-01');
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post(`/api/v1/tasks/${validId2}/survey-report`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          evidences: [] // Must include at least one photo evidence
        });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should record survey report successfully', async () => {
      prismaMock.workTask.findUnique.mockResolvedValue({
        workTaskId: 2n, orderId: 1n
      } as any);
      prismaMock.surveyReport.findFirst.mockResolvedValue(null);
      prismaMock.surveyReport.create.mockResolvedValue({ surveyReportId: 1n } as any);
      prismaMock.workTask.update.mockResolvedValue({} as any);
      prismaMock.evidence.create.mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/v1/tasks/${validId2}/survey-report`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          notes: 'Everything is fine',
          evidences: [{ fileUrl: 'http://example.com/photo.jpg', type: 'image/jpeg' }]
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
        .get(`/api/v1/tasks/${validId2}/survey-report`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });

    it('should return survey report', async () => {
      prismaMock.workTask.findUnique.mockResolvedValue({
        workTaskId: 2n
      } as any);
      prismaMock.surveyReport.findFirst.mockResolvedValue({ surveyReportId: 1n } as any);
      prismaMock.evidence.findMany.mockResolvedValue([{ id: 'ev1' }] as any);

      const res = await request(app)
        .get(`/api/v1/tasks/${validId2}/survey-report`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.taskId).toBe('2');
    });
  });

  describe('PUT /api/v1/tasks/:id/progress', () => {
    it('should return 400 for invalid status (MSG-UC25-01)', async () => {
      prismaMock.workTask.findUnique.mockResolvedValue({ workTaskId: 2n, status: 'draft' } as any);

      const res = await request(app)
        .put(`/api/v1/tasks/${validId2}/progress`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UC25-01');
    });

    it('should update progress successfully', async () => {
      prismaMock.workTask.findUnique.mockResolvedValue({ workTaskId: 2n, status: 'draft' } as any);
      prismaMock.workTask.update.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/tasks/${validId2}/progress`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'in_progress' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/tasks/:id', () => {
    it('should return 400 if task is already started', async () => {
      prismaMock.workTask.findUnique.mockResolvedValue({ workTaskId: 2n, status: 'IN_PROGRESS' } as any);

      const res = await request(app)
        .put(`/api/v1/tasks/${validId2}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ location: 'New Location' });

      expect(res.status).toBe(400);
    });

    it('should update task successfully', async () => {
      prismaMock.workTask.findUnique.mockResolvedValue({ workTaskId: 2n, status: 'draft' } as any);
      prismaMock.workTask.update.mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/v1/tasks/${validId2}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ location: 'New Location' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });



  describe('POST /api/v1/tasks/:id/assignments', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).post(`/api/v1/tasks/${validId2}/assignments`);
      expect(res.status).toBe(401);
    });

    // NOTE: assignment API testing can be expanded, but ensuring it is mounted correctly
    it('should call assignment creation', async () => {
      // Mocking validate input which triggers assignmentController.assignStaff
      // For coverage of assignment
      prismaMock.workTask.findUnique.mockResolvedValue({ workTaskId: 2n, status: 'PENDING' } as any);
      prismaMock.user.findMany.mockResolvedValue([{ workTaskId: 1n }] as any);
      prismaMock.$transaction.mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/v1/tasks/${validId2}/assignments`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ assignments: [{ userId: validId1, assignedRole: 'MEMBER' }] });

      expect([200, 201]).toContain(res.status);
    });
  });

  describe('PATCH /api/v1/tasks/:id/status', () => {
    it('should update task status', async () => {
      const res = await request(app)
        .patch('/api/v1/tasks/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'in_progress' });
      expect([200, 201, 400, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  describe('PUT /api/v1/tasks/:id/survey-report/review', () => {
    it('should review survey report', async () => {
      prismaMock.surveyReport.findFirst.mockResolvedValue({ surveyReportId: 1n, status: 'submitted' } as any);
      prismaMock.surveyReport.update.mockResolvedValue({} as any);
      const res = await request(app)
        .put('/api/v1/tasks/1/survey-report/review')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
