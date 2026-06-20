import request from 'supertest';
import app from '../app';
import { prismaMock } from './singleton';
import jwt from 'jsonwebtoken';

const mockToken = jwt.sign({ userId: 1, role: 'Staff' }, process.env.JWT_SECRET || 'secret');

describe('Master Reference Data API (Module 03)', () => {
  describe('GET /api/v1/equipment', () => {
    it('should return 200 and equipment list (Happy Path)', async () => {
      const mockEquipments = [
        {
          id: 101n,
          code: 'EQ-AUD-LOA01',
          name: 'Loa Hội Trường Công Suất Lớn JBL',
          category: { id: 5n, name: 'Thiết bị âm thanh' }
        }
      ];

      prismaMock.catalogItem.findMany.mockResolvedValue(mockEquipments as any);

      const response = await request(app)
        .get('/api/v1/equipment?categoryId=5')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data[0].code).toBe('EQ-AUD-LOA01');
    });

    it('should return 400 if categoryId is invalid (Bad Request)', async () => {
      const response = await request(app)
        .get('/api/v1/equipment?categoryId=invalid')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 200 with empty array if no matches (Edge Case)', async () => {
      prismaMock.catalogItem.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/v1/equipment?search=NonExistent')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });
});
