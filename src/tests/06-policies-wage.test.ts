import request from 'supertest';
import app from '../app';
import { prismaMock } from './singleton';
import jwt from 'jsonwebtoken';

const adminToken = jwt.sign({ userId: 1, role: 'Admin' }, process.env.JWT_SECRET || 'secret');

describe('Module 06: Policies & Wage API', () => {
  describe('GET /api/v1/business-policies', () => {
    it('should return 200 and list of policies', async () => {
      prismaMock.businessPolicy.findMany.mockResolvedValue([{ code: 'MIN_DEPOSIT', policy_value: 30 }] as any);
      const res = await request(app).get('/api/v1/business-policies').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/v1/business-policies/:code', () => {
    it('should return 200 on success', async () => {
      prismaMock.businessPolicy.findUnique.mockResolvedValue({ code: 'MIN_DEPOSIT' } as any);
      prismaMock.businessPolicy.update.mockResolvedValue({ code: 'MIN_DEPOSIT' } as any);
      const res = await request(app).put('/api/v1/business-policies/MIN_DEPOSIT')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ policy_value: 40.00, unit: '%', description: 'Updated' });
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/v1/wage-rules', () => {
    it('should return 201 on success', async () => {
      prismaMock.role.findUnique.mockResolvedValue({ id: 3n } as any);
      prismaMock.wageRule.create.mockResolvedValue({ id: 6n } as any);
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      const res = await request(app).post('/api/v1/wage-rules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role_id: 3, session_type: 'night_setup', wage_amount: 500000, valid_from: '2026-07-01' });
      expect(res.status).toBe(201);
    });
  });
});
