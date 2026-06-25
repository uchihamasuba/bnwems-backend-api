import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './error.middleware';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError || (error && typeof error === 'object' && (error as any).name === 'ZodError')) {
        // Collect all validation errors into a formatted string or array
        const zodError = error as any;
        const issues = zodError.errors || zodError.issues;
        const message = issues ? issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ') : (error as any).message;
        return next(new AppError(`Validation error: ${message}`, 400, 'VALIDATION_ERROR'));
      }
      return next(error);
    }
  };
};
