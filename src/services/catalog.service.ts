import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

// ============================================================================
// CATALOG CATEGORY
// ============================================================================

export const catalogCategoryService = {
  async getCatalogCategories(page: number, limit: number, search?: string, isActive?: boolean) {
    const skip = (page - 1) * limit;

    const where: Prisma.CatalogCategoryWhereInput = {};
    if (search) {
      where.name = { contains: search };
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [categories, totalCount] = await Promise.all([
      prisma.catalogCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { displayOrder: 'asc' },
        include: {
          _count: {
            select: { items: true },
          },
        },
      }),
      prisma.catalogCategory.count({ where }),
    ]);

    // Map _count.items to totalEquipment for frontend compatibility
    const mappedCategories = categories.map(cat => ({
      id: cat.categoryId.toString(),
      name: cat.name,
      description: cat.description,
      displayOrder: cat.displayOrder,
      notes: cat.notes,
      isActive: cat.isActive,
      totalEquipment: cat._count.items,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));

    return { categories: mappedCategories, totalCount };
  },

  async getCatalogCategoryById(id: string) {
    const category = await prisma.catalogCategory.findUnique({
      where: { categoryId: BigInt(id) },
      include: {
        _count: { select: { items: true } },
      },
    });

    if (!category) {
      const error: any = new Error('Catalog category not found');
      error.statusCode = 404;
      throw error;
    }

    return {
      id: category.categoryId.toString(),
      name: category.name,
      description: category.description,
      displayOrder: category.displayOrder,
      notes: category.notes,
      isActive: category.isActive,
      totalEquipment: category._count.items,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  },

  async createCatalogCategory(data: any) {
    const newCategory = await prisma.catalogCategory.create({
      data: {
        name: data.name,
        description: data.description,
        displayOrder: data.displayOrder ?? 0,
        notes: data.notes,
      },
    });
    return {
      ...newCategory,
      categoryId: newCategory.categoryId.toString(),
    };
  },

  async updateCatalogCategory(id: string, data: any) {
    const categoryId = BigInt(id);

    const existing = await prisma.catalogCategory.findUnique({
      where: { categoryId },
    });
    if (!existing) {
      const error: any = new Error('Catalog category not found');
      error.statusCode = 404;
      throw error;
    }

    const updatedCategory = await prisma.catalogCategory.update({
      where: { categoryId },
      data: {
        name: data.name,
        description: data.description,
        displayOrder: data.displayOrder,
        notes: data.notes,
      },
    });

    return {
      ...updatedCategory,
      categoryId: updatedCategory.categoryId.toString(),
    };
  },

  async updateCatalogCategoryStatus(id: string, isActive: boolean) {
    const categoryId = BigInt(id);

    const existing = await prisma.catalogCategory.findUnique({
      where: { categoryId },
    });
    if (!existing) {
      const error: any = new Error('Catalog category not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.catalogCategory.update({
      where: { categoryId },
      data: { isActive },
    });
  },
};

// ============================================================================
// CATALOG ITEM
// ============================================================================

export const catalogItemService = {
  async getCatalogItems(
    page: number,
    limit: number,
    search?: string,
    itemType?: string,
    categoryId?: string,
    isActive?: boolean
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.CatalogItemWhereInput = {};
    if (search) {
      where.name = { contains: search };
    }
    if (itemType) {
      where.itemType = itemType;
    }
    if (categoryId) {
      where.categoryId = BigInt(categoryId);
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [items, totalCount] = await Promise.all([
      prisma.catalogItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.catalogItem.count({ where }),
    ]);

    const mappedItems = items.map(item => ({
      id: item.itemId.toString(),
      name: item.name,
      description: item.description,
      itemType: item.itemType,
      basePrice: Number(item.basePrice),
      categoryId: item.categoryId?.toString() || null,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return { items: mappedItems, totalCount };
  },

  async getCatalogItemById(id: string) {
    const item = await prisma.catalogItem.findUnique({
      where: { itemId: BigInt(id) },
    });

    if (!item) {
      const error: any = new Error('Catalog item not found');
      error.statusCode = 404;
      throw error;
    }

    return {
      id: item.itemId.toString(),
      name: item.name,
      description: item.description,
      itemType: item.itemType,
      basePrice: Number(item.basePrice),
      categoryId: item.categoryId?.toString() || null,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },

  async createCatalogItem(data: any) {
    const newItem = await prisma.catalogItem.create({
      data: {
        name: data.name,
        description: data.description,
        itemType: data.itemType,
        basePrice: data.basePrice,
        categoryId: data.categoryId ? BigInt(data.categoryId) : null,
      },
    });

    return {
      ...newItem,
      itemId: newItem.itemId.toString(),
      categoryId: newItem.categoryId?.toString() || null,
      basePrice: Number(newItem.basePrice),
    };
  },

  async updateCatalogItem(id: string, data: any) {
    const itemId = BigInt(id);

    const existing = await prisma.catalogItem.findUnique({
      where: { itemId },
    });
    if (!existing) {
      const error: any = new Error('Catalog item not found');
      error.statusCode = 404;
      throw error;
    }

    const updatedItem = await prisma.catalogItem.update({
      where: { itemId },
      data: {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        categoryId: data.categoryId ? BigInt(data.categoryId) : null,
      },
    });

    return {
      ...updatedItem,
      itemId: updatedItem.itemId.toString(),
      categoryId: updatedItem.categoryId?.toString() || null,
      basePrice: Number(updatedItem.basePrice),
    };
  },

  async updateCatalogItemStatus(id: string, isActive: boolean) {
    const itemId = BigInt(id);

    const existing = await prisma.catalogItem.findUnique({
      where: { itemId },
    });
    if (!existing) {
      const error: any = new Error('Catalog item not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.catalogItem.update({
      where: { itemId },
      data: { isActive },
    });
  },
};
