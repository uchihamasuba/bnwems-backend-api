import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Manager API', () => {
  const managerToken = generateTestToken({ userId: '1', role: 'MANAGER' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/manager/approvals', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get('/api/v1/manager/approvals');
      expect(res.status).toBe(401);
    });

    it('should return 200 and list pending approvals', async () => {
      prismaMock.orderWarning.findMany.mockResolvedValue([
        { warningId: 1n, orderId: 1n, content: 'Test Warning' } as any,
      ]);
      prismaMock.surveyReport.findMany.mockResolvedValue([
        { surveyReportId: 1n, orderId: 1n, workTaskId: 1n, recordedBy: 1n, status: 'DRAFT' } as any,
      ]);

      const res = await request(app)
        .get('/api/v1/manager/approvals')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderWarnings).toHaveLength(1);
      expect(res.body.data.surveyReports).toHaveLength(1);
    });
  });
});
