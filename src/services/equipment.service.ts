import prisma from '../config/database';

export interface GetEquipmentQuery {
  categoryId?: number;
  search?: string;
}

export const equipmentService = {
  async getEquipments(query: GetEquipmentQuery) {
    const where: Record<string, unknown> = { isActive: true };
    if (query.categoryId) where.categoryId = Number(query.categoryId);
    if (query.search) where.equipmentName = { contains: query.search };

    const equipments = await prisma.equipment.findMany({
      where,
      include: { category: { select: { id: true, categoryName: true } } },
      orderBy: { equipmentName: 'asc' },
    });

    return equipments;
  },
};
