import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import * as assignmentController from '../controllers/assignment.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticate);

// These routes may be mounted on /api/v1/orders/:orderId/tasks
// or /api/v1/tasks

router.get('/', authorizeRoles('ADMIN', 'MANAGER'), taskController.getTasks);
router.get('/assigned', taskController.getAssignedTasks);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), taskController.createTask);

router.get('/:id/pick-list', taskController.viewPickList);
router.get('/:id/survey-report', authorizeRoles('ADMIN', 'MANAGER'), taskController.viewSurveyReport);
router.post('/:id/survey-report', authorizeRoles('LEADER_STAFF', 'MANAGER'), taskController.recordSurveyReport);

router.put('/:id/progress', authorizeRoles('LEADER_STAFF', 'MANAGER'), taskController.updateTaskProgress);
router.post('/:id/assignments', authorizeRoles('ADMIN', 'MANAGER'), assignmentController.assignStaff);

router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), taskController.updateTask);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), taskController.deleteTask);

export default router;
