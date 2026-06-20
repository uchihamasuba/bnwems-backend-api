import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export class CatalogService {
  static async getCatalogItems(page: number = 1, limit: number = 20, search?: string, categoryId?: number, status?: string) {
    const skip = (page - 1) * limit;
    
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { code: { contains: search } }
      ];
    }
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    if (status) {
      whereClause.status = status;
    }

    const [items, total] = await Promise.all([
      prisma.catalogItem.findMany({
        where: whereClause,
        include: {
          category: { select: { id: true, name: true } },
          priceHistories: {
            where: { validTo: null },
            select: { price: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.catalogItem.count({ where: whereClause })
    ]);

    const formattedItems = items.map(item => ({
      id: Number(item.id),
      code: item.code,
      name: item.name,
      category_id: Number(item.categoryId),
      category_name: item.category.name,
      unit: item.unit,
      status: item.status,
      current_price: item.priceHistories[0]?.price ? Number(item.priceHistories[0].price) : null
    }));

    return {
      data: formattedItems,
      meta: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  static async getCatalogItemById(id: number) {
    const item = await prisma.catalogItem.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        priceHistories: {
          where: { validTo: null },
          select: { price: true }
        }
      }
    });

    if (!item) {
      throw new AppError('Hàng hóa không tồn tại', 404, 'MSG-CAT-03');
    }

    return {
      id: Number(item.id),
      code: item.code,
      name: item.name,
      category_id: Number(item.categoryId),
      category_name: item.category.name,
      unit: item.unit,
      description: item.description,
      status: item.status,
      current_price: item.priceHistories[0]?.price ? Number(item.priceHistories[0].price) : null
    };
  }

  static async createCatalogItem(data: { code: string; name: string; category_id: number; unit: string; description?: string }, createdBy: number) {
    if (!data.code || !data.name || !data.category_id || !data.unit) {
        throw new AppError('Thiếu field bắt buộc', 400, 'MSG-CAT-02');
    }

    const category = await prisma.catalogCategory.findUnique({ where: { id: data.category_id } });
    if (!category) {
      throw new AppError('Danh mục không tồn tại', 404, 'MSG-CAT-03');
    }

    const existingItem = await prisma.catalogItem.findUnique({ where: { code: data.code } });
    if (existingItem) {
      throw new AppError('Mã hàng hóa đã tồn tại', 409, 'MSG-CAT-04');
    }

    const newItem = await prisma.catalogItem.create({
      data: {
        code: data.code,
        name: data.name,
        categoryId: data.category_id,
        unit: data.unit,
        description: data.description,
        createdBy
      }
    });

    return {
      id: Number(newItem.id),
      code: newItem.code,
      status: newItem.status
    };
  }

  static async updateCatalogItem(id: number, data: { name?: string; category_id?: number; unit?: string; description?: string }) {
    const item = await prisma.catalogItem.findUnique({ where: { id } });
    if (!item) {
      throw new AppError('Hàng hóa không tồn tại', 404, 'MSG-CAT-05');
    }

    if (data.category_id) {
      const category = await prisma.catalogCategory.findUnique({ where: { id: data.category_id } });
      if (!category) {
        throw new AppError('Danh mục không tồn tại', 404, 'MSG-CAT-03');
      }
    }

    const updatedItem = await prisma.catalogItem.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.category_id && { categoryId: data.category_id }),
        ...(data.unit && { unit: data.unit }),
        ...(data.description !== undefined && { description: data.description })
      }
    });

    return { id: Number(updatedItem.id) };
  }

  static async updateCatalogItemStatus(id: number, status: string) {
    const item = await prisma.catalogItem.findUnique({ where: { id } });
    if (!item) {
      throw new AppError('Hàng hóa không tồn tại', 404, 'MSG-CAT-06');
    }

    const updatedItem = await prisma.catalogItem.update({
      where: { id },
      data: { status }
    });

    return { id: Number(updatedItem.id), status: updatedItem.status };
  }

  static async getCatalogCategories() {
    const categories = await prisma.catalogCategory.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return categories.map(c => ({
      id: Number(c.id),
      name: c.name,
      description: c.description,
      status: c.status
    }));
  }

  static async createCatalogCategory(data: { name: string; description?: string }, createdBy: number) {
    if (!data.name) {
        throw new AppError('Thiếu field bắt buộc', 400, 'MSG-CAT-07');
    }
    const newCategory = await prisma.catalogCategory.create({
      data: {
        name: data.name,
        description: data.description,
        createdBy
      }
    });

    return {
      id: Number(newCategory.id),
      name: newCategory.name,
      status: newCategory.status
    };
  }

  static async updateCatalogCategory(id: number, data: { name?: string; description?: string }) {
    const category = await prisma.catalogCategory.findUnique({ where: { id } });
    if (!category) {
      throw new AppError('Danh mục không tồn tại', 404, 'MSG-CAT-08');
    }

    const updatedCategory = await prisma.catalogCategory.update({
      where: { id },
      data
    });

    return { id: Number(updatedCategory.id) };
  }

  static async getItemPriceHistory(id: number) {
    const item = await prisma.catalogItem.findUnique({ where: { id } });
    if (!item) {
      throw new AppError('Hàng hóa không tồn tại', 404, 'MSG-SP-04');
    }

    const histories = await prisma.itemPriceHistory.findMany({
      where: { catalogItemId: id },
      orderBy: { validFrom: 'desc' }
    });

    return histories.map(h => ({
      id: Number(h.id),
      price: Number(h.price),
      valid_from: h.validFrom,
      valid_to: h.validTo
    }));
  }

  static async setItemPrice(id: number, price: number, validFrom: string, createdBy: number) {
    const item = await prisma.catalogItem.findUnique({ where: { id } });
    if (!item) {
      throw new AppError('Hàng hóa không tồn tại', 404, 'MSG-SP-04');
    }

    if (item.status === 'inactive') {
      throw new AppError('Hàng hóa đang inactive, không được đặt giá mới', 409, 'MSG-SP-03');
    }

    if (price <= 0 || !validFrom) {
      throw new AppError('Giá phải lớn hơn 0 và cần có ngày hiệu lực', 400, 'MSG-SP-02');
    }

    const fromDate = new Date(validFrom);

    const result = await prisma.$transaction(async (tx) => {
      const currentPrice = await tx.itemPriceHistory.findFirst({
        where: { catalogItemId: id, validTo: null }
      });

      if (currentPrice) {
        await tx.itemPriceHistory.update({
          where: { id: currentPrice.id },
          data: { validTo: fromDate }
        });
      }

      const newPrice = await tx.itemPriceHistory.create({
        data: {
          catalogItemId: id,
          price,
          validFrom: fromDate,
          createdBy
        }
      });

      return newPrice;
    });

    return {
      id: Number(result.id),
      price: Number(result.price),
      valid_from: result.validFrom,
      valid_to: result.validTo
    };
  }
}