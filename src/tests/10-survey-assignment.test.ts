import request from 'supertest';
import app from '../app';
import { prismaMock } from './singleton';
import jwt from 'jsonwebtoken';

const managerToken = jwt.sign({ userId: 2, role: 'Manager' }, process.env.JWT_SECRET || 'secret');

describe('Module 10: Survey & Assignment API', () => {
  describe('POST /api/v1/orders/:id/surveys', () => {
    it('should return 201 on scheduling survey', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ id: 10n } as any);
      prismaMock.surveyReport.create.mockResolvedValue({ id: 7n } as any);
      const res = await request(app).post('/api/v1/orders/10/surveys')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ survey_date: '2026-06-25', surveyed_by: 12 });
      expect(res.status).toBe(201);
    });
  });

  describe('POST /api/v1/orders/:id/assignments', () => {
    it('should return 201 on assigning staff', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ id: 10n } as any);
      prismaMock.user.findUnique.mockResolvedValue({ id: 12n, status: 'active' } as any);
      prismaMock.assignment.findFirst.mockResolvedValue(null);
      prismaMock.assignment.create.mockResolvedValue({ id: 25n } as any);
      const res = await request(app).post('/api/v1/orders/10/assignments')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ user_id: 12, assigned_date: '2026-07-01', session_type: 'morning', role_in_event: 'Thợ chính' });
      expect(res.status).toBe(201);
    });
  });

  describe('POST /api/v1/attendance/:id/verify', () => {
    it('should return 200 on verifying attendance', async () => {
      prismaMock.attendance.update.mockResolvedValue({ id: 60n, status: 'verified' } as any);
      const res = await request(app).post('/api/v1/attendance/60/verify')
        .set('Authorization', `Bearer ${managerToken}`);
      expect(res.status).toBe(200);
    });
  });
  
  describe('POST /api/v1/handovers/:id/confirm', () => {
    it('should return 200 on confirming handover', async () => {
      prismaMock.handover.update.mockResolvedValue({ id: 18n, status: 'confirmed' } as any);
      const res = await request(app).post('/api/v1/handovers/18/confirm')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ decision: 'confirmed', notes: 'OK' });
      expect(res.status).toBe(200);
    });
  });
});
