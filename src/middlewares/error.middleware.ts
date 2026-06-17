import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Global error handling middleware.
 * Catches all errors passed via next(err) and returns a standardized JSON response.
 */
export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An internal server error occurred.'
      : err.message;

  console.error(`[ERROR] ${req.method} ${req.path} — ${err.message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errorDetails: process.env.NODE_ENV === 'development' ? err.stack : null,
  });
};

/**
 * 404 Not Found handler — mount after all routes.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};
