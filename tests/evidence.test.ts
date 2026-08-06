import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { generateTestToken } from './setup/authMock';
import * as firebaseConfig from '../src/config/firebase';

import { EvidenceService } from '../src/services/evidence.service';

// Mock EvidenceService to avoid real firebase and database calls
jest.mock('../src/services/evidence.service', () => {
  return {
    EvidenceService: {
      uploadAndSaveEvidence: jest.fn(),
      getEvidenceById: jest.fn(),
    }
  };
});

describe('Evidence API', () => {
  const adminToken = generateTestToken({ userId: '1', role: 'ADMIN' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/evidence/upload', () => {
    it('should upload a file and return evidence details', async () => {
      (EvidenceService.uploadAndSaveEvidence as jest.Mock).mockResolvedValue({
        evidenceId: 1n,
        fileUrl: 'https://firebase.com/mock-url.jpg',
        description: null,
        uploadedBy: 1n,
      });

      const res = await request(app)
        .post('/api/v1/evidence/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('entityType', 'ORDER')
        .field('entityId', '1')
        .attach('file', Buffer.from('mock file content'), 'test.jpg');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fileUrl).toBe('https://firebase.com/mock-url.jpg');
    });

    it('should return 400 if no file is provided', async () => {
      const res = await request(app)
        .post('/api/v1/evidence/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('entityType', 'ORDER')
        .field('entityId', '1');

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UF-01');
    });
  });

  describe('GET /api/v1/evidence/:id', () => {
    it('should return evidence by id', async () => {
      (EvidenceService.getEvidenceById as jest.Mock).mockResolvedValue({
        evidenceId: 1n,
        fileUrl: 'https://firebase.com/mock-url.jpg',
        description: null,
        uploadedBy: 1n,
      });

      const res = await request(app)
        .get('/api/v1/evidence/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.evidenceId).toBe('1');
    });
  });
});
