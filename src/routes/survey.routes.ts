import { Router } from 'express';
import { SurveyController } from '../controllers/survey.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);
router.get('/:id', authorizeRoles('admin', 'manager', 'leader_staff'), SurveyController.getSurveyReportById);
router.post('/:id/assign', authorizeRoles('admin', 'manager'), SurveyController.assignSurvey);
router.put('/:id', authorizeRoles('admin', 'manager', 'leader_staff'), SurveyController.updateSurveyReport);
router.post('/:id/submit', authorizeRoles('admin', 'manager', 'leader_staff'), SurveyController.submitSurveyReport);

export default router;