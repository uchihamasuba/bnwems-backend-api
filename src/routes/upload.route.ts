import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { upload } from '../middlewares/upload.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint for image upload
router.post('/image', authenticate, upload.single('file'), UploadController.uploadImage);

export default router;
