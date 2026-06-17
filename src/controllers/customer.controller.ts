import { Request, Response, NextFunction } from 'express';
import { customerService } from '../services/customer.service';

export const customerController = {
  async getCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await customerService.getCustomers();
      res.status(200).json({ success: true, statusCode: 200, data });
    } catch (err) { next(err); }
  },

  async getCustomerById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await customerService.getCustomerById(Number(req.params.id));
      res.status(200).json({ success: true, statusCode: 200, data });
    } catch (err) { next(err); }
  },

  async createCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await customerService.createCustomer(req.body);
      res.status(201).json({ success: true, statusCode: 201, data });
    } catch (err) { next(err); }
  },
};
