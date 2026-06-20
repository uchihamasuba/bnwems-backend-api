import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './error.middleware';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Please provide a valid token.', 401);
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };
    
    // Attach user to request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token has expired. Please login again.', 401));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token.', 401));
    }
    next(error);
  }
};

// RBAC Authorization Middleware
export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Not authenticated.', 401));
    }

    const userRole = req.user.role.toLowerCase().replace(/ /g, '_');
    const allowedRoles = roles.map(r => r.toLowerCase().replace(/ /g, '_'));

    if (!allowedRoles.includes(userRole)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};

export { authenticate as verifyToken };