import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';

describe('Warehouse History API', () => {
  const adminToken = generateTestToken({ userId: '1', role: { roleId: '1', roleName: 'ADMIN' } });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/warehouse-histories', () => {
    it('should return mapped inventory reports', async () => {
      prismaMock.inventoryReport.findMany.mockResolvedValue([{
        inventoryReportId: 1n, orderId: 1n, reportType: 'checkout', recordedBy: 1n, confirmedBy: null, status: 'submitted', note: null, createdAt: new Date(), updatedAt: new Date()
      }] as any);
      prismaMock.inventoryReport.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/warehouse-histories?transactionType=CHECKOUT')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].transactionType).toBe('CHECKOUT');
    });
  });
});
