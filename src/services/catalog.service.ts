import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class CatalogService {
  public async getCatalogItems(page: number, limit: number, search?: string, itemType?: string, isActiveParam?: string) {
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (search) {
      whereClause.name = { contains: search };
    }
    if (itemType) whereClause.itemType = itemType;
    if (isActiveParam !== undefined) whereClause.isActive = isActiveParam === 'true';

    const [items, totalCount] = await Promise.all([
      prisma.catalogItem.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.catalogItem.count({ where: whereClause }),
    ]);

    return { items, totalCount };
  }

  public async getCatalogItemById(id: string) {
    const item = await prisma.catalogItem.findUnique({ where: { id } });
    if (!item) {
      throw new AppError('Catalog item not found.', 404);
    }
    return item;
  }

  public async createCatalogItem(data: any, actionUserId: string) {
    const { name, description, itemType, basePrice } = data;

    const newItem = await prisma.catalogItem.create({
      data: { name, description, itemType, basePrice },
    });

    await prisma.auditLog.create({
      data: {
        userId: actionUserId,
        action: 'CREATE_CATALOG_ITEM',
        entityType: 'CatalogItem',
        entityId: newItem.id,
      },
    });

    return newItem;
  }

  public async updateCatalogItem(id: string, data: any, actionUserId: string) {
    const { name, description, basePrice } = data;

    const item = await prisma.catalogItem.update({
      where: { id },
      data: { name, description, basePrice },
    });

    await prisma.auditLog.create({
      data: {
        userId: actionUserId,
        action: 'UPDATE_CATALOG_ITEM',
        entityType: 'CatalogItem',
        entityId: id,
      },
    });

    return item;
  }

  public async deactivateCatalogItem(id: string, isActive: boolean, actionUserId: string) {
    await prisma.catalogItem.update({
      where: { id },
      data: { isActive },
    });

    await prisma.auditLog.create({
      data: {
        userId: actionUserId,
        action: 'DEACTIVATE_CATALOG_ITEM',
        entityType: 'CatalogItem',
        entityId: id,
        details: { isActive } as any,
      },
    });
  }
}

export const catalogService = new CatalogService();
