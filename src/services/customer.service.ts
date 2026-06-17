import prisma from '../config/database';

export interface CreateCustomerPayload {
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  companyTaxCode?: string;
}

export const customerService = {
  async createCustomer(payload: CreateCustomerPayload) {
    // Generate customer code: CUST-YYYY-NNNN
    const count = await prisma.customer.count();
    const customerCode = `CUST-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const customer = await prisma.customer.create({
      data: {
        customerCode,
        fullName: payload.fullName,
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
        companyTaxCode: payload.companyTaxCode,
      },
    });

    return { id: customer.id, fullName: customer.fullName, customerCode: customer.customerCode };
  },

  async getCustomers() {
    return prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async getCustomerById(id: number) {
    const customer = await prisma.customer.findUnique({ where: { id }, include: { orders: true } });
    if (!customer) {
      const err: Error & { statusCode?: number } = new Error('Không tìm thấy khách hàng.');
      err.statusCode = 404;
      throw err;
    }
    return customer;
  },
};
