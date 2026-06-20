import { Router } from 'express';
import { EvidenceController } from '../controllers/evidence.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.use(authenticate);

router.post('/', upload.single('file'), EvidenceController.uploadFile);

export default router;
