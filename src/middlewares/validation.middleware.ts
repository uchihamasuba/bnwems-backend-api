import { Request, Response, NextFunction } from 'express';

/**
 * Middleware factory: Validate request body fields.
 * Pass an array of required field names; returns 400 if any are missing/empty.
 */
export const validateBody = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing: string[] = [];

    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: `Missing required fields: ${missing.join(', ')}.`,
        errorDetails: missing,
      });
      return;
    }

    next();
  };
};
