import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Manager API', () => {
  const adminToken = generateTestToken({ userId: '1', role: { roleId: '1', roleName: 'ADMIN' } });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/manager/approvals', () => {
    it('should return 401 if unauthorized', async () => {
      const res = await request(app).get('/api/v1/manager/approvals');
      expect(res.status).toBe(401);
    });

    it('should return 200 and list pending approvals', async () => {
      prismaMock.changeRequest.findMany.mockResolvedValue([
        { changeRequestId: 1n, orderId: 1n, requestedBy: 1n, status: 'pending' } as any
      ]);
      prismaMock.surveyReport.findMany.mockResolvedValue([
        { surveyReportId: 1n, orderId: 1n, workTaskId: 1n, recordedBy: 1n, status: 'submitted' } as any
      ]);

      const res = await request(app)
        .get('/api/v1/manager/approvals')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.changeRequests).toHaveLength(1);
      expect(res.body.data.surveyReports).toHaveLength(1);
    });
  });
});
