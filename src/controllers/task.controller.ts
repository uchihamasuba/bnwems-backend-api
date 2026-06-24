import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { taskService } from '../services/task.service';

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { orderId, taskType, status } = req.query;

    const { tasks, totalCount } = await taskService.getTasks(page, limit, orderId as string, taskType as string, status as string);

    res.status(200).json({
      success: true,
      data: tasks,
      meta: { page, limit, totalCount },
    });
  } catch (error) {
    next(error);
  }
};

export const getAssignedTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { date, status } = req.query;

    const tasks = await taskService.getAssignedTasks(userId, date as string, status as string);

    res.status(200).json({
      success: true,
      data: tasks,
      meta: { totalCount: tasks.length },
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // If called via POST /orders/:orderId/tasks, orderId is in params
    // If called via POST /tasks, orderId is in body
    const finalOrderId = req.params.orderId || req.body.orderId;
    
    const newTask = await taskService.createTask(finalOrderId, req.body);

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: { id: newTask.id },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await taskService.updateTask(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await taskService.deleteTask(id);

    res.status(200).json({
      success: true,
      message: 'Task deleted.',
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    await taskService.updateTaskProgress(id, status, notes);

    res.status(200).json({
      success: true,
      message: 'Task progress updated.',
    });
  } catch (error) {
    next(error);
  }
};

export const recordSurveyReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { notes, evidences } = req.body;
    const userId = req.user!.userId;

    await taskService.recordSurveyReport(id, notes, evidences, userId);

    res.status(201).json({
      success: true,
      message: 'Survey report submitted.',
    });
  } catch (error) {
    next(error);
  }
};

export const viewSurveyReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const data = await taskService.viewSurveyReport(id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const viewPickList = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const items = await taskService.viewPickList(id);

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};
