import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export class TaskService {
  static async updateTaskProgress(id: string, data: any, userId: string) {
    // In this MVP, tasks are just TaskProgressUpdate model representing order task progress
    // Wait, the API spec says `PATCH /tasks/{id}/progress`, so we might need to create a TaskProgressUpdate record
    
    // Check if the order ID is passed in data since task_id doesn't map directly to an order if tasks aren't in DB yet
    // Assuming task id maps to a task in assignment?
    // Since task is just an ID in the task progress update:
    const update = await prisma.taskProgressUpdate.create({
      data: {
        taskId: BigInt(id),
        status: data.status,
        notes: data.notes
      }
    });

    return {
      id: Number(update.taskId),
      status: update.status
    };
  }
}
