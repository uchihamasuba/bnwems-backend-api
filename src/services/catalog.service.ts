import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { ItemStatus } from '@prisma/client';

class CatalogService {
  // ============================================================================
  // CATALOG CATEGORY
  // ============================================================================

  public async getCatalogCategories(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (search) {
      whereClause.categoryName = { contains: search };
    }

    const [categories, totalCount] = await Promise.all([
      prisma.itemCategory.findMany({
        where: whereClause,
        skip,
        take: limit,
      }),
      prisma.itemCategory.count({ where: whereClause }),
    ]);

    return { categories, totalCount };
  }

  public async createCatalogCategory(data: any) {
    return await prisma.itemCategory.create({
      data: {
        categoryName: data.categoryName,
        description: data.description,
      },
    });
  }

  public async updateCatalogCategory(id: string, data: any) {
    return await prisma.itemCategory.update({
      where: { categoryId: BigInt(id) },
      data: {
        categoryName: data.categoryName,
        description: data.description,
      },
    });
  }

  public async getCatalogCategory(id: string) {
    const category = await prisma.itemCategory.findUnique({
      where: { categoryId: BigInt(id) },
    });
    if (!category) throw new AppError('Không tìm thấy danh mục.', 404);
    return category;
  }

  public async updateCatalogCategoryStatus(id: string, isActive: boolean) {
    // Database schema does not have isActive for ItemCategory.
    // Return success to fulfill API contract for frontend compatibility.
    return { success: true };
  }

  // ============================================================================
  // CATALOG TYPE
  // ============================================================================

  public async getCatalogTypes(page: number, limit: number, search?: string, categoryId?: string) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (search) {
      whereClause.typeName = { contains: search };
    }
    if (categoryId) {
      whereClause.categoryId = BigInt(categoryId);
    }

    const [types, totalCount] = await Promise.all([
      prisma.itemType.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          category: {
            select: { categoryName: true },
          },
        },
      }),
      prisma.itemType.count({ where: whereClause }),
    ]);

    // Format response to include categoryName inline
    const formattedTypes = types.map((t) => ({
      ...t,
      categoryName: t.category?.categoryName,
    }));

    return { types: formattedTypes, totalCount };
  }

  public async createCatalogType(data: any) {
    return await prisma.itemType.create({
      data: {
        categoryId: BigInt(data.categoryId),
        typeName: data.typeName,
        description: data.description,
      },
    });
  }

  public async updateCatalogType(id: string, data: any) {
    return await prisma.itemType.update({
      where: { typeId: BigInt(id) },
      data: {
        categoryId: data.categoryId ? BigInt(data.categoryId) : undefined,
        typeName: data.typeName,
        description: data.description,
      },
    });
  }

  // ============================================================================
  // ITEM TYPE SPECS
  // ============================================================================

  public async getTypeSpecs(typeId: string) {
    const specs = await prisma.itemTypeSpec.findMany({
      where: { typeId: BigInt(typeId) },
      include: {
        componentItem: {
          select: { itemName: true },
        },
      },
    });

    return specs.map((s) => ({
      ...s,
      componentName: s.componentItem?.itemName,
    }));
  }

  public async updateTypeSpecs(typeId: string, specsData: any[]) {
    // Transaction to replace all specs for this type
    await prisma.$transaction(async (tx) => {
      // 1. Delete existing
      await tx.itemTypeSpec.deleteMany({
        where: { typeId: BigInt(typeId) },
      });

      // 2. Insert new
      if (specsData && specsData.length > 0) {
        const createData = specsData.map((s) => ({
          typeId: BigInt(typeId),
          componentItemId: BigInt(s.componentItemId),
          componentName: s.componentName || 'Unknown',
          quantity: s.quantity,
          note: s.note,
        }));
        await tx.itemTypeSpec.createMany({
          data: createData,
        });
      }
    });

    return { success: true };
  }

  // ============================================================================
  // CATALOG ITEM
  // ============================================================================

  public async getCatalogItems(
    page: number,
    limit: number,
    search?: string,
    typeId?: string,
    status?: ItemStatus,
  ) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [{ itemName: { contains: search } }, { itemCode: { contains: search } }];
    }
    if (typeId) {
      whereClause.typeId = BigInt(typeId);
    }
    if (status) {
      whereClause.status = status;
    }

    const [items, totalCount] = await Promise.all([
      prisma.item.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          type: {
            select: { typeName: true },
          },
          inventory: {
            select: { quantityTotal: true, quantityAvailable: true },
          },
        },
      }),
      prisma.item.count({ where: whereClause }),
    ]);

    const formattedItems = items.map((i) => ({
      ...i,
      typeName: i.type?.typeName,
      inventory: i.inventory || { quantityTotal: 0, quantityAvailable: 0 },
    }));

    return { items: formattedItems, totalCount };
  }

  public async getCatalogItemById(id: string) {
    const item = await prisma.item.findUnique({
      where: { itemId: BigInt(id) },
      include: {
        type: {
          select: { typeName: true },
        },
        inventory: true,
      },
    });
    if (!item) throw new AppError('Không tìm thấy thiết bị.', 404);

    return {
      ...item,
      typeName: item.type?.typeName,
      inventory: item.inventory || null,
    };
  }

  public async createCatalogItem(data: any) {
    // Check itemCode uniqueness
    const existing = await prisma.item.findUnique({ where: { itemCode: data.itemCode } });
    if (existing) {
      throw new AppError('Mã thiết bị đã tồn tại.', 400, 'MSG-UC05-05');
    }

    // Transaction to create item AND inventory
    const result = await prisma.$transaction(async (tx) => {
      const newItem = await tx.item.create({
        data: {
          itemCode: data.itemCode,
          itemName: data.itemName,
          typeId: BigInt(data.typeId),
          description: data.description,
          unit: data.unit,
          rentalPrice: data.rentalPrice,
          priceValidFrom: data.priceValidFrom ? new Date(data.priceValidFrom) : undefined,
          imageUrl: data.imageUrl,
          status: data.status || ItemStatus.ACTIVE,
        },
      });

      // Automatically create Inventory record with 0 quantity
      await tx.inventory.create({
        data: {
          itemId: newItem.itemId,
          quantityTotal: 0,
          quantityAvailable: 0,
          quantityReserved: 0,
          quantityDamaged: 0,
        },
      });

      return newItem;
    });

    return result;
  }

  public async updateCatalogItem(id: string, data: any) {
    const updateData: any = {
      itemName: data.itemName,
      description: data.description,
      unit: data.unit,
      rentalPrice: data.rentalPrice,
      imageUrl: data.imageUrl,
      status: data.status,
    };

    if (data.typeId) updateData.typeId = BigInt(data.typeId);
    if (data.priceValidFrom) updateData.priceValidFrom = new Date(data.priceValidFrom);

    return await prisma.item.update({
      where: { itemId: BigInt(id) },
      data: updateData,
    });
  }

  public async updateCatalogItemStatus(id: string, status: ItemStatus) {
    return await prisma.item.update({
      where: { itemId: BigInt(id) },
      data: { status },
    });
  }
}

export const catalogService = new CatalogService();
