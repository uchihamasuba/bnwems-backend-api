import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import * as assignmentController from '../controllers/assignment.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

export const nestedTaskRouter = Router({ mergeParams: true });
nestedTaskRouter.use(authenticate);

import { validate } from '../middlewares/validate.middleware';
import {
  getTasksSchema, getAssignedTasksSchema, createTaskSchema,
  updateTaskSchema, cancelTaskSchema, updateTaskProgressSchema,
  recordSurveyReportSchema, viewSurveyReportSchema, viewPickListSchema,
  reviewSurveyReportSchema
} from '../validators/task.validator';
import { assignStaffSchema } from '../validators/assignment.validator';

nestedTaskRouter.post('/', authorizeRoles('ADMIN', 'MANAGER'), validate(createTaskSchema), taskController.createTask);

export const taskRouter = Router();
taskRouter.use(authenticate);
taskRouter.get('/', authorizeRoles('ADMIN', 'MANAGER'), validate(getTasksSchema), taskController.getTasks);
taskRouter.get('/assigned', validate(getAssignedTasksSchema), taskController.getAssignedTasks);
taskRouter.get('/:id/pick-list', validate(viewPickListSchema), taskController.viewPickList);
taskRouter.get('/:id/survey-report', authorizeRoles('ADMIN', 'MANAGER'), validate(viewSurveyReportSchema), taskController.viewSurveyReport);
taskRouter.post('/:id/survey-report', authorizeRoles('LEADER_STAFF', 'MANAGER'), validate(recordSurveyReportSchema), taskController.recordSurveyReport);
taskRouter.put('/:id/survey-report/review', authorizeRoles('ADMIN', 'MANAGER'), validate(reviewSurveyReportSchema), taskController.reviewSurveyReport);
taskRouter.put('/:id/progress', authorizeRoles('LEADER_STAFF', 'MANAGER'), validate(updateTaskProgressSchema), taskController.updateTaskProgress);
taskRouter.post('/:id/assignments', authorizeRoles('ADMIN', 'MANAGER'), validate(assignStaffSchema), assignmentController.assignStaff);
taskRouter.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), validate(updateTaskSchema), taskController.updateTask);
taskRouter.patch('/:id/status', authorizeRoles('ADMIN', 'MANAGER'), validate(cancelTaskSchema), taskController.cancelTask);
