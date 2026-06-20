import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export class CustomerController {
  static async createCustomer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.createCustomer(req.body, req.user!.userId);
      sendSuccess(res, 'Customer created successfully', customer, 'CREATE_SUCCESS', 201);
    } catch (error) { next(error); }
  }

  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const result = await CustomerService.getCustomers(page, limit, search);
      sendSuccess(res, 'Customers retrieved successfully', result.data, 'SUCCESS', 200, { total: result.total, page, limit });
    } catch (error) { next(error); }
  }

  static async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.getCustomerById(req.params.id);
      sendSuccess(res, 'Customer retrieved successfully', customer);
    } catch (error) { next(error); }
  }

  static async updateCustomer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.updateCustomer(req.params.id, req.body, req.user!.userId);
      sendSuccess(res, 'Customer updated successfully', customer);
    } catch (error) { next(error); }
  }
}