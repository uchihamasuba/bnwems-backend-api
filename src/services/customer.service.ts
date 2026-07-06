import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class CustomerService {
  public async getCustomers(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { customerName: { contains: search } },
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

    return { customers, totalCount };
  }

  public async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({ where: { customerId: BigInt(id) } });
    if (!customer) throw new AppError('Không tìm thấy khách hàng.', 404);
    return customer;
  }

  public async createCustomer(data: any, actionUserId: string) {
    const { customerName, phone, email, address } = data;

    const existing = await prisma.customer.findFirst({ where: { phone } });
    if (existing) {
      throw new AppError('Số điện thoại đã tồn tại.', 400, 'MSG-UC09-05');
    }

    const newCustomer = await prisma.customer.create({
      data: {
        customerCode: 'CUS' + Date.now(),
        creator: { connect: { userId: BigInt(actionUserId) } },
        customerName,
        phone,
        email,
        address,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: BigInt(actionUserId),
        action: 'CREATE_CUSTOMER',
        entityType: 'Customer',
        entityId: newCustomer.customerId,
      },
    });

    return newCustomer;
  }

  public async updateCustomer(id: string, data: any, actionUserId: string) {
    const { customerName, email, address } = data;

    const updatedCustomer = await prisma.customer.update({
      where: { customerId: BigInt(id) },
      data: {
        customerName,
        email,
        address,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: BigInt(actionUserId),
        action: 'UPDATE_CUSTOMER',
        entityType: 'Customer',
        entityId: BigInt(id),
      },
    });

    return updatedCustomer;
  }
}

export const customerService = new CustomerService();
