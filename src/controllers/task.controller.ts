import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { orderId, taskType, status } = req.query;

    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (orderId) whereClause.orderId = orderId;
    if (taskType) whereClause.taskType = taskType;
    if (status) whereClause.status = status;

    const [tasks, totalCount] = await Promise.all([
      prisma.workTask.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { scheduledStart: 'asc' },
      }),
      prisma.workTask.count({ where: whereClause }),
    ]);

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

    const whereClause: any = {
      assignments: { some: { userId } },
    };
    if (status) whereClause.status = status;
    if (date) {
      const targetDate = new Date(date as string);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      whereClause.scheduledStart = {
        gte: targetDate,
        lt: nextDate,
      };
    }

    const tasks = await prisma.workTask.findMany({
      where: whereClause,
      orderBy: { scheduledStart: 'asc' },
    });

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
    const orderId = req.params.orderId || req.body.orderId;
    const { taskType, scheduledStart, scheduledEnd, location } = req.body;

    if (!orderId || !taskType || !scheduledStart || !scheduledEnd) {
      return next(new AppError('Required information is missing', 400));
    }

    const newTask = await prisma.workTask.create({
      data: {
        orderId,
        taskType,
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: new Date(scheduledEnd),
        location,
        status: 'PENDING',
      },
    });

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
    const { scheduledStart, scheduledEnd, location } = req.body;

    const existing = await prisma.workTask.findUnique({ where: { id } });
    if (!existing) return next(new AppError('Task not found', 404));

    if (existing.status !== 'PENDING') {
      return next(new AppError('Cannot modify an already started task. Only update progress.', 400));
    }

    await prisma.workTask.update({
      where: { id },
      data: {
        scheduledStart: scheduledStart ? new Date(scheduledStart) : existing.scheduledStart,
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : existing.scheduledEnd,
        location: location || existing.location,
      },
    });

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
    const existing = await prisma.workTask.findUnique({ where: { id } });
    if (!existing) return next(new AppError('Task not found', 404));

    if (existing.status !== 'PENDING') {
      return next(new AppError('Task cannot be deleted because it has already started or been executed.', 400, 'MSG-UC55-06'));
    }

    await prisma.workTask.delete({ where: { id } });

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

    const existing = await prisma.workTask.findUnique({ where: { id } });
    if (!existing) return next(new AppError('Task not found', 404));

    const updateData: any = { status, notes };

    if (status === 'IN_PROGRESS' && existing.status === 'PENDING') {
      updateData.actualStart = new Date();
    } else if (status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      updateData.actualEnd = new Date();
    } else if (status !== 'IN_PROGRESS' && status !== 'COMPLETED') {
      return next(new AppError('Invalid status update.', 400, 'MSG-UC25-01'));
    }

    await prisma.workTask.update({
      where: { id },
      data: updateData,
    });

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

    const existingTask = await prisma.workTask.findUnique({
      where: { id },
      include: { evidences: true },
    });
    if (!existingTask) return next(new AppError('Task not found', 404));

    if (existingTask.evidences.length > 0) {
      return next(new AppError('Survey report already submitted.', 400, 'MSG-UC12-01'));
    }

    if (!evidences || !Array.isArray(evidences) || evidences.length === 0) {
      return next(new AppError('Must include at least one photo evidence.', 400));
    }

    await prisma.workTask.update({
      where: { id },
      data: {
        notes,
        status: 'COMPLETED',
        actualEnd: new Date(),
        evidences: {
          create: evidences.map(e => ({
            fileUrl: e.fileUrl,
            evidenceType: 'SURVEY_PHOTO',
            uploadedBy: req.user!.userId,
          })),
        },
      },
    });

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
    const task = await prisma.workTask.findUnique({
      where: { id },
      include: { evidences: true },
    });

    if (!task) return next(new AppError('Task not found', 404));

    res.status(200).json({
      success: true,
      data: {
        taskId: task.id,
        notes: task.notes,
        evidences: task.evidences,
        submittedAt: task.actualEnd || task.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const viewPickList = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const task = await prisma.workTask.findUnique({
      where: { id },
      include: { order: { include: { quotations: { where: { status: 'ACCEPTED' } } } } },
    });

    if (!task) return next(new AppError('Task not found', 404));
    
    // Pick-list is derived from the accepted quotation details
    const quotation = task.order.quotations[0];
    let items: any[] = [];
    if (quotation && quotation.details && (quotation.details as any).items) {
      items = (quotation.details as any).items;
    }

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};
