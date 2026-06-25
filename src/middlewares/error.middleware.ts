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

  console.log('DEBUG ERR:', err, 'isOperational:', (err as any).isOperational, 'statusCode:', (err as any).statusCode);

  if (err instanceof AppError || (err && typeof err === 'object' && (err as any).isOperational)) {
    statusCode = (err as AppError).statusCode || 500;
    message = err.message;
    code = (err as AppError).code || 'ERROR';
  } else if (err && typeof err === 'object' && err.name === 'PrismaClientKnownRequestError') {
    // Handle Prisma specific errors if needed
    statusCode = 400;
    message = 'Database request error';
    code = 'DB_ERROR';
  }

  // Log error stack in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error] ${err?.stack || err}`);
  } else {
    console.error(`[Error] ${err?.message || err}`);
  }

  res.status(statusCode).json({
    success: false,
    code,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};