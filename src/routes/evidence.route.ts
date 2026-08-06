import { Router } from 'express';
import { evidenceController } from '../controllers/evidence.controller';
import { upload } from '../middlewares/upload.middleware';
import { verifyToken as protect } from '../middlewares/auth.middleware';

const router = Router();

router.post('/upload', protect, upload.single('file'), evidenceController.uploadEvidence);

router.get('/:id', protect, evidenceController.getEvidenceById);

export default router;
