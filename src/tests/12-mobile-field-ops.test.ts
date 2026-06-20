import request from 'supertest';
import app from '../app';
import { prismaMock } from './singleton';
import jwt from 'jsonwebtoken';

const techToken = jwt.sign({ userId: 3, role: 'Technical Staff' }, process.env.JWT_SECRET || 'secret');

describe('Module 12: Mobile Field Ops API', () => {
  describe('GET /api/v1/my/assignments', () => {
    it('should return 200 and list of assignments', async () => {
      prismaMock.assignment.findMany.mockResolvedValue([{ id: 25n }] as any);
      const res = await request(app).get('/api/v1/my/assignments').set('Authorization', `Bearer ${techToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/v1/surveys/:id', () => {
    it('should return 200 on saving survey draft', async () => {
      const leaderToken = jwt.sign({ userId: 3, role: 'Leader Staff' }, process.env.JWT_SECRET || 'secret');
      prismaMock.surveyReport.findUnique.mockResolvedValue({ id: 7n } as any);
      prismaMock.surveyReport.update.mockResolvedValue({ id: 7n } as any);
      const res = await request(app).put('/api/v1/surveys/7')
        .set('Authorization', `Bearer ${leaderToken}`)
        .send({ venue_notes: 'Sảnh rộng' });
      expect(res.status).toBe(200);
    });
  });
});
