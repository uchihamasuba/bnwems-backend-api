import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export interface GetEquipmentQuery {
  categoryId?: number;
  search?: string;
}

export const equipmentService = {
  async getEquipments(query: GetEquipmentQuery) {
    if (query.categoryId !== undefined && isNaN(query.categoryId)) {
      throw new AppError('Invalid categoryId', 400);
    }

    const where: any = { type: 'equipment' };
    if (query.categoryId) {
      where.categoryId = BigInt(query.categoryId);
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { code: { contains: query.search } },
      ];
    }

    const items = await prisma.catalogItem.findMany({ where, include: { category: true } });

    return items.map((item: any) => ({
      id: Number(item.id),
      code: item.code,
      name: item.name,
      category: item.category ? {
        id: Number(item.category.id),
        name: item.category.name,
      } : null
    }));
  },
};
