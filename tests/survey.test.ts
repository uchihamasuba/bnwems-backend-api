import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';
import { SurveyStatus } from '@prisma/client';

describe('Survey Reports API', () => {
  const token = generateTestToken({ userId: '1', role: 'ADMIN' });
  const validId = '1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/orders/:orderId/survey-reports', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get(`/api/v1/orders/${validId}/survey-reports`);
      expect(res.status).toBe(401);
    });

    it('should return survey reports for order', async () => {
      prismaMock.surveyReport.findMany.mockResolvedValue([
        { surveyReportId: 1n, location: 'Hall A' } as any,
      ]);

      const res = await request(app)
        .get(`/api/v1/orders/${validId}/survey-reports`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/v1/survey-reports/:id', () => {
    it('should return survey report by id', async () => {
      prismaMock.surveyReport.findUnique.mockResolvedValue({
        surveyReportId: 1n,
        location: 'Hall A',
      } as any);

      const res = await request(app)
        .get(`/api/v1/survey-reports/${validId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 if not found', async () => {
      prismaMock.surveyReport.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/v1/survey-reports/${validId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/v1/survey-reports', () => {
    it('should create survey report', async () => {
      prismaMock.surveyReport.create.mockResolvedValue({ surveyReportId: 1n } as any);

      const res = await request(app)
        .post('/api/v1/survey-reports')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderId: 1,
          surveyDate: new Date().toISOString(),
          location: 'Hall A',
          area: 100,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/v1/survey-reports')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderId: 1,
          // missing required location and surveyDate
        });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/v1/survey-reports/:id/confirm', () => {
    it('should confirm survey report', async () => {
      prismaMock.surveyReport.findUnique.mockResolvedValue({ surveyReportId: 1n } as any);
      prismaMock.surveyReport.update.mockResolvedValue({ surveyReportId: 1n } as any);

      const res = await request(app)
        .put(`/api/v1/survey-reports/${validId}/confirm`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: SurveyStatus.CONFIRMED });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
