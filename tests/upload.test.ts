import request from 'supertest';
import app from '../src/app';
import { UploadService } from '../src/services/upload.service';
import { generateTestToken } from './setup/authMock';
import path from 'path';
import fs from 'fs';

// Mock the UploadService so we don't actually hit Firebase during tests
jest.mock('../src/services/upload.service');

describe('Upload API (Contract 14)', () => {
  const token = generateTestToken({ userId: '1', role: { roleId: '1', roleName: 'ADMIN' } });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/upload/image', () => {
    it('should return 400 if no file is provided (MSG-UF-01)', async () => {
      const res = await request(app)
        .post('/api/v1/upload/image')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UF-01');
    });

    it('should return 400 if file format is not supported (MSG-UF-02)', async () => {
      // Create a dummy text file to simulate unsupported format
      const buffer = Buffer.from('this is not an image');
      
      const res = await request(app)
        .post('/api/v1/upload/image')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', buffer, 'test.txt');
      
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MSG-UF-02');
    });

    it('should return 200 and image URL on successful upload (MSG-UF-00)', async () => {
      // Mock the service return value
      const mockResult = {
        url: 'https://firebasestorage.googleapis.com/v0/b/project.appspot.com/o/avatars%2Fimage123.jpg?alt=media',
        fileName: 'image123.jpg',
        folder: 'avatars',
        size: 1024,
        mimeType: 'image/jpeg',
      };

      (UploadService.uploadImageToFirebase as jest.Mock).mockResolvedValue(mockResult);

      const buffer = Buffer.from('fake image content');
      
      const res = await request(app)
        .post('/api/v1/upload/image')
        .set('Authorization', `Bearer ${token}`)
        .field('folder', 'avatars')
        .attach('file', buffer, { filename: 'test.jpg', contentType: 'image/jpeg' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.code).toBe('MSG-UF-00');
      expect(res.body.data.url).toBe(mockResult.url);
      expect(res.body.data.folder).toBe('avatars');
      
      // Ensure the service was called with the correct folder
      expect(UploadService.uploadImageToFirebase).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if upload to Firebase fails (MSG-UF-04)', async () => {
      // Mock an error from the service
      (UploadService.uploadImageToFirebase as jest.Mock).mockRejectedValue(new Error('Firebase error'));

      const buffer = Buffer.from('fake image content');
      
      const res = await request(app)
        .post('/api/v1/upload/image')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', buffer, { filename: 'test.jpg', contentType: 'image/jpeg' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('MSG-UF-04');
    });
  });
});
