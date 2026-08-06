import { Request, Response } from 'express';
import { UploadService } from '../services/upload.service';
import { sendSuccess, sendError } from '../utils/response';

export class UploadController {
  static async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        sendError(res, 'No file provided or file is empty.', 'MSG-UF-01', 400);
        return;
      }

      // Basic validation for image
      if (!file.mimetype.startsWith('image/')) {
        sendError(res, 'File format not supported. Only images are allowed.', 'MSG-UF-02', 400);
        return;
      }

      const folder = req.body.folder || 'general';

      const data = await UploadService.uploadImageToFirebase(file, folder);

      sendSuccess(res, 'Image uploaded successfully', data, 'MSG-UF-00');
    } catch (error: any) {
      console.error('Upload Error:', error);
      sendError(res, 'Upload to Firebase Storage failed.', 'MSG-UF-04', 500, error.message);
    }
  }
}
