import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';

export const getSchedules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const orderId = req.query.orderId as string;
    const activityType = req.query.activityType as string;
    const status = req.query.status as string;
    
    const { tasks, totalCount } = await taskService.getTasks(page, limit, orderId, activityType, status);

    const schedules = tasks.map(t => {
      let descObj: any = {};
      try {
        if (t.description) descObj = JSON.parse(t.description);
      } catch (e) {}

      return {
        id: t.workTaskId.toString(),
        orderId: t.orderId.toString(),
        activityType: t.title,
        scheduledStart: descObj.scheduledStart || t.createdAt,
        scheduledEnd: descObj.scheduledEnd || t.updatedAt,
        location: descObj.location || null,
        status: t.status,
        createdAt: t.createdAt
      };
    });

    res.status(200).json({
      success: true,
      data: schedules,
      meta: { page, limit, totalCount }
    });
  } catch (error) {
    next(error);
  }
};
