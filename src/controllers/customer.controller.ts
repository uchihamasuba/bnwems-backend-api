import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { customerService } from '../services/customer.service';

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const { customers, totalCount } = await customerService.getCustomers(page, limit, search);

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
    const customer = await customerService.getCustomerById(id);

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
    const actionUserId = req.user!.userId;
    const newCustomer = await customerService.createCustomer(req.body, actionUserId);

    res.status(201).json({
      success: true,
      message: 'Đăng ký khách hàng thành công.',
      data: { id: newCustomer.customerId },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const actionUserId = req.user!.userId;

    await customerService.updateCustomer(id, req.body, actionUserId);

    res.status(200).json({
      success: true,
      message: 'Cập nhật khách hàng thành công.',
    });
  } catch (error) {
    next(error);
  }
};
