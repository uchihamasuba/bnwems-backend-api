import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  userId: number;
  roleId: number;
  roleName: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/**
 * Middleware: Verify Bearer JWT token from Authorization header.
 */
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Unauthorized: No token provided.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Unauthorized: Token is invalid or has expired.',
    });
  }
};

/**
 * Middleware factory: Restrict access to specific role names.
 * Usage: requireRole('Admin', 'Manager')
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, statusCode: 401, message: 'Unauthorized.' });
      return;
    }

    if (!allowedRoles.includes(req.user.roleName)) {
      res.status(403).json({
        success: false,
        statusCode: 403,
        message: 'Forbidden: You do not have permission to access this resource.',
      });
      return;
    }

    next();
  };
};
