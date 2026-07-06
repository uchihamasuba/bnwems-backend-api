import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  message: string,
  data: any = null,
  code: string = 'SUCCESS',
  statusCode = 200,
  meta: any = undefined,
) => {
  res.status(statusCode).json({
    success: true,
    code,
    message,
    data,
    ...(meta && { meta }),
  });
};

export const sendError = (
  res: Response,
  message: string,
  code: string = 'ERROR',
  statusCode = 400,
  errorDetails: any = null,
) => {
  res.status(statusCode).json({
    success: false,
    code,
    message,
    ...(errorDetails && { errorDetails }),
  });
};
