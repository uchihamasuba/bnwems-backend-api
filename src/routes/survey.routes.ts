import { Router } from 'express';
import { surveyController } from '../controllers/survey.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
router.use(verifyToken);

// POST /api/v1/surveys/schedule
router.post('/schedule', requireRole('Manager'), surveyController.scheduleSurvey);

// PUT /api/v1/surveys/:id/report
router.put('/:id/report', requireRole('Leader Staff'), surveyController.submitReport);

export default router;
