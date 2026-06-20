import request from 'supertest';
import app from '../app';
import { prismaMock } from './singleton';
import jwt from 'jsonwebtoken';

const adminToken = jwt.sign({ userId: 1, role: 'Admin' }, process.env.JWT_SECRET || 'secret');

describe('Customer Management API (Module 05)', () => {
  describe('POST /api/v1/customers', () => {
    it('should return 201 on successful customer creation (Happy Path)', async () => {
      prismaMock.customer.findUnique.mockResolvedValue(null);
      prismaMock.customer.create.mockResolvedValue({
        id: 50n,
        fullName: 'Công ty TNHH Sự Kiện Hòa Bình',
        phone: '0243123456'
      } as any);

      const response = await request(app)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Công ty TNHH Sự Kiện Hòa Bình',
          phone: '0243123456',
          email: 'contact@hoabinspeed.com',
          address: 'Số 29 Cầu Giấy, Hà Nội'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(prismaMock.customer.create).toHaveBeenCalled();
    });

    it('should return 400 when required fields are missing (Bad Request)', async () => {
      const response = await request(app)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Thiếu thông tin'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 409 if phone number already exists (Edge Case)', async () => {
      prismaMock.customer.findUnique.mockResolvedValue({ id: 10n } as any);

      const response = await request(app)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Công ty ABC',
          phone: '0243123456',
          email: 'abc@example.com',
          address: 'Hà Nội'
        });

      expect([400, 409]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });
  });
});
