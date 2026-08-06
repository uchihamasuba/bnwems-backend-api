import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (
        error instanceof ZodError ||
        (error && typeof error === 'object' && (error as any).name === 'ZodError')
      ) {
        const issues = (error as ZodError).issues;
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: issues
            ? issues.map((e: any) => ({
                path: e.path.join('.'),
                message: e.message,
              }))
            : (error as any).message,
        });
      }
      return next(error);
    }
  };
};
