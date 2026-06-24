import { prisma } from '../config/database';

class SupplierService {
  public async getSuppliers(page: number, limit: number, search?: string, status?: string) {
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (search) {
      whereClause.name = { contains: search };
    }
    if (status) whereClause.status = status;

    const [suppliers, totalCount] = await Promise.all([
      prisma.supplier.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.supplier.count({ where: whereClause }),
    ]);

    return { suppliers, totalCount };
  }

  public async createSupplier(data: any, actionUserId: string) {
    const { name, contactPerson, phone, email, address } = data;

    const newSupplier = await prisma.supplier.create({
      data: { name, contactPerson, phone, email, address },
    });

    await prisma.auditLog.create({
      data: {
        userId: actionUserId,
        action: 'CREATE_SUPPLIER',
        entityType: 'Supplier',
        entityId: newSupplier.id,
      },
    });

    return newSupplier;
  }
}

export const supplierService = new SupplierService();
