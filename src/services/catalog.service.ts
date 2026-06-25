import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class CatalogService {
  public async getCatalogItems(page: number, limit: number, search?: string, category?: string, status?: string) {
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (search) {
      whereClause.name = { contains: search };
    }
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;

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
    const item = await prisma.catalogItem.findUnique({ where: { catalogItemId: BigInt(id) } });
    if (!item) {
      throw new AppError('Catalog item not found.', 404);
    }
    return item;
  }

  public async createCatalogItem(data: any, actionUserId: string) {
    const { code, name, category, unit, currentRentalPrice, currentCost, replacementValue } = data;

    const newItem = await prisma.catalogItem.create({
      data: { 
        code: code || `ITM-${Date.now()}`,
        name, 
        category, 
        unit, 
        currentRentalPrice, 
        currentCost, 
        replacementValue,
        status: 'active'
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: BigInt(actionUserId),
        action: 'CREATE_CATALOG_ITEM',
        entityType: 'CatalogItem',
        entityId: newItem.catalogItemId,
      },
    });

    return newItem;
  }

  public async updateCatalogItem(id: string, data: any, actionUserId: string) {
    const { code, name, category, unit, currentRentalPrice, currentCost, replacementValue } = data;

    const item = await prisma.catalogItem.update({
      where: { catalogItemId: BigInt(id) },
      data: { 
        ...(code && { code }),
        ...(name && { name }), 
        ...(category && { category }),
        ...(unit && { unit }),
        ...(currentRentalPrice !== undefined && { currentRentalPrice }),
        ...(currentCost !== undefined && { currentCost }),
        ...(replacementValue !== undefined && { replacementValue })
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: BigInt(actionUserId),
        action: 'UPDATE_CATALOG_ITEM',
        entityType: 'CatalogItem',
        entityId: BigInt(id),
      },
    });

    return item;
  }

  public async deactivateCatalogItem(id: string, status: string, actionUserId: string) {
    await prisma.catalogItem.update({
      where: { catalogItemId: BigInt(id) },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        userId: BigInt(actionUserId),
        action: 'DEACTIVATE_CATALOG_ITEM',
        entityType: 'CatalogItem',
        entityId: BigInt(id),
      },
    });
  }
}

export const catalogService = new CatalogService();
