import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { fullName: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where: whereClause }),
    ]);

    res.status(200).json({
      success: true,
      data: customers,
      meta: { page, limit, totalCount },
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({ where: { id } });

    if (!customer) return next(new AppError('Customer not found', 404));

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fullName, phone, email, address } = req.body;

    if (!fullName || !phone) {
      return next(new AppError('Full name and phone are required.', 400, 'MSG-UC09-01'));
    }

    const existing = await prisma.customer.findUnique({ where: { phone } });
    if (existing) {
      return next(new AppError('Phone number already exists.', 400, 'MSG-UC09-05'));
    }

    const newCustomer = await prisma.customer.create({
      data: { fullName, phone, email, address },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'CREATE_CUSTOMER',
        entityType: 'Customer',
        entityId: newCustomer.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully.',
      data: { id: newCustomer.id },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { fullName, email, address } = req.body;

    await prisma.customer.update({
      where: { id },
      data: { fullName, email, address },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'UPDATE_CUSTOMER',
        entityType: 'Customer',
        entityId: id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};
