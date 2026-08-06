import { Request, Response, NextFunction } from 'express';
import { catalogService } from '../services/catalog.service';
import { ItemStatus } from '@prisma/client';
import { BigIntUtils } from '../utils/bigint.util';

export const catalogController = {
  // ============================================================================
  // CATALOG CATEGORY
  // ============================================================================

  async getCatalogCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;

      const { categories, totalCount } = await catalogService.getCatalogCategories(
        page,
        limit,
        search,
      );

      res.status(200).json({
        success: true,
        code: 'MSG-CT-01',
        data: BigIntUtils.toJSON(categories),
        meta: { page, limit, totalCount },
      });
    } catch (error) {
      next(error);
    }
  },

  async createCatalogCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const newCategory = await catalogService.createCatalogCategory(req.body);
      res.status(201).json({
        success: true,
        code: 'MSG-CT-02',
        message: 'Tạo danh mục thành công.',
        data: BigIntUtils.toJSON(newCategory),
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCatalogCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedCategory = await catalogService.updateCatalogCategory(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Cập nhật danh mục thành công.',
        data: BigIntUtils.toJSON(updatedCategory),
      });
    } catch (error) {
      next(error);
    }
  },

  async getCatalogCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await catalogService.getCatalogCategory(req.params.id);
      res.status(200).json({
        success: true,
        data: BigIntUtils.toJSON(category),
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCatalogCategoryStatus(req: Request, res: Response, next: NextFunction) {
    try {
      await catalogService.updateCatalogCategoryStatus(req.params.id, req.body.isActive);
      res.status(200).json({
        success: true,
        message: 'Thay đổi trạng thái danh mục thành công.',
      });
    } catch (error) {
      next(error);
    }
  },
  // ============================================================================
  // CATALOG TYPE
  // ============================================================================

  async getCatalogTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const categoryId = req.query.categoryId as string;

      const { types, totalCount } = await catalogService.getCatalogTypes(
        page,
        limit,
        search,
        categoryId,
      );

      res.status(200).json({
        success: true,
        code: 'MSG-CT-03',
        data: BigIntUtils.toJSON(types),
        meta: { page, limit, totalCount },
      });
    } catch (error) {
      next(error);
    }
  },

  async createCatalogType(req: Request, res: Response, next: NextFunction) {
    try {
      const newType = await catalogService.createCatalogType(req.body);
      res.status(201).json({
        success: true,
        code: 'MSG-CT-04',
        message: 'Tạo loại thiết bị thành công.',
        data: BigIntUtils.toJSON(newType),
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCatalogType(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedType = await catalogService.updateCatalogType(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Cập nhật loại thiết bị thành công.',
        data: BigIntUtils.toJSON(updatedType),
      });
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // ITEM TYPE SPECS
  // ============================================================================

  async getTypeSpecs(req: Request, res: Response, next: NextFunction) {
    try {
      const specs = await catalogService.getTypeSpecs(req.params.id);
      res.status(200).json({
        success: true,
        code: 'MSG-CT-05',
        data: BigIntUtils.toJSON(specs),
      });
    } catch (error) {
      next(error);
    }
  },

  async updateTypeSpecs(req: Request, res: Response, next: NextFunction) {
    try {
      await catalogService.updateTypeSpecs(req.params.id, req.body.specs);
      res.status(200).json({
        success: true,
        code: 'MSG-CT-06',
        message: 'Cập nhật cấu hình loại thiết bị thành công.',
      });
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // CATALOG ITEM
  // ============================================================================

  async getCatalogItems(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const typeId = req.query.typeId as string;
      const status = req.query.status as ItemStatus;

      const { items, totalCount } = await catalogService.getCatalogItems(
        page,
        limit,
        search,
        typeId,
        status,
      );

      res.status(200).json({
        success: true,
        code: 'MSG-CT-07',
        data: BigIntUtils.toJSON(items),
        meta: { page, limit, totalCount },
      });
    } catch (error) {
      next(error);
    }
  },

  async getCatalogItemById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await catalogService.getCatalogItemById(req.params.id);
      res.status(200).json({
        success: true,
        data: BigIntUtils.toJSON(item),
      });
    } catch (error) {
      next(error);
    }
  },

  async createCatalogItem(req: Request, res: Response, next: NextFunction) {
    try {
      const newItem = await catalogService.createCatalogItem(req.body);
      res.status(201).json({
        success: true,
        code: 'MSG-CT-08',
        message: 'Tạo thiết bị thành công.',
        data: BigIntUtils.toJSON(newItem),
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCatalogItem(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedItem = await catalogService.updateCatalogItem(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Cập nhật thiết bị thành công.',
        data: BigIntUtils.toJSON(updatedItem),
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCatalogItemStatus(req: Request, res: Response, next: NextFunction) {
    try {
      await catalogService.updateCatalogItemStatus(req.params.id, req.body.status as ItemStatus);
      res.status(200).json({
        success: true,
        code: 'MSG-CT-09',
        message: 'Thay đổi trạng thái thiết bị thành công.',
      });
    } catch (error) {
      next(error);
    }
  },
};
