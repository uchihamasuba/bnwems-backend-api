import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string = 'ERROR', isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    Error.captureStackTrace(this);
  }
}

export const errorMiddleware = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'SERVER_ERROR';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  } else if (err.name === 'PrismaClientKnownRequestError') {
    // Handle Prisma specific errors if needed
    statusCode = 400;
    message = 'Database request error';
    code = 'DB_ERROR';
  }

  // Log error stack in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error] ${err.stack}`);
  } else {
    console.error(`[Error] ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    code,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};