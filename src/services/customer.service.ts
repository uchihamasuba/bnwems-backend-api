import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export class CustomerService {
  static async createCustomer(data: { fullName: string; phone: string; email?: string; address?: string; notes?: string }, userId: string) {
    if (!data.fullName || !data.phone) {
      throw new AppError('Missing required fields: fullName or phone', 400);
    }
    const existing = await prisma.customer.findUnique({ where: { phone: data.phone } });
    if (existing) throw new AppError('Customer with this phone already exists', 400);
    const newCustomer = await prisma.customer.create({
      data: {
        ...data,
        createdBy: BigInt(userId),
        updatedBy: BigInt(userId)
      }
    });
    return {
      ...newCustomer,
      id: Number(newCustomer.id),
      createdBy: Number(newCustomer.createdBy),
      updatedBy: Number(newCustomer.updatedBy)
    };
  }

  static async getCustomers(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where = search ? {
      OR: [
        { fullName: { contains: search } },
        { phone: { contains: search } }
      ]
    } : {};
    
    const [data, total] = await Promise.all([
      prisma.customer.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.customer.count({ where })
    ]);
    return { data, total, page, limit };
  }

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({ where: { id: BigInt(id) }, include: { orders: true } });
    if (!customer) throw new AppError('Customer not found', 404);
    return customer;
  }

  static async updateCustomer(id: string, data: any, userId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: BigInt(id) } });
    if (!customer) throw new AppError('Customer not found', 404);
    
    return prisma.customer.update({
      where: { id: BigInt(id) },
      data: { ...data, updatedBy: BigInt(userId) }
    });
  }
}