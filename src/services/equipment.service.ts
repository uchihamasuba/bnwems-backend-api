import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class EquipmentService {
  public async getEquipments(page: number, limit: number, search?: string, category?: string, status?: string) {
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (search) {
      whereClause.name = { contains: search };
    }
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;

    const [items, totalCount] = await Promise.all([
      prisma.equipment.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.equipment.count({ where: whereClause }),
    ]);

    return { items, totalCount };
  }

  public async getEquipmentById(id: string) {
    const item = await prisma.equipment.findUnique({ where: { equipmentItemId: BigInt(id) } });
    if (!item) {
      throw new AppError('Không tìm thấy thiết bị.', 404);
    }
    return item;
  }

  public async createEquipment(data: any, actionUserId: string) {
    const { code, name, category, unit, rentalPrice, costPrice, replacementValue } = data;

    const newItem = await prisma.equipment.create({
      data: { 
        code: code || `ITM-${Date.now()}`,
        name, 
        category, 
        unit, 
        rentalPrice, 
        costPrice, 
        replacementValue,
        status: 'active'
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: BigInt(actionUserId),
        action: 'CREATE_CATALOG_ITEM',
        entityType: 'Equipment',
        entityId: newItem.equipmentItemId,
      },
    });

    return newItem;
  }

  public async updateEquipment(id: string, data: any, actionUserId: string) {
    const { code, name, category, unit, rentalPrice, costPrice, replacementValue } = data;

    const item = await prisma.equipment.update({
      where: { equipmentItemId: BigInt(id) },
      data: { 
        ...(code && { code }),
        ...(name && { name }), 
        ...(category && { category }),
        ...(unit && { unit }),
        ...(rentalPrice !== undefined && { rentalPrice }),
        ...(costPrice !== undefined && { costPrice }),
        ...(replacementValue !== undefined && { replacementValue })
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: BigInt(actionUserId),
        action: 'UPDATE_CATALOG_ITEM',
        entityType: 'Equipment',
        entityId: BigInt(id),
      },
    });

    return item;
  }

  public async deactivateEquipment(id: string, status: string, actionUserId: string) {
    await prisma.equipment.update({
      where: { equipmentItemId: BigInt(id) },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        userId: BigInt(actionUserId),
        action: 'DEACTIVATE_CATALOG_ITEM',
        entityType: 'Equipment',
        entityId: BigInt(id),
      },
    });
  }
}

export const equipmentService = new EquipmentService();
