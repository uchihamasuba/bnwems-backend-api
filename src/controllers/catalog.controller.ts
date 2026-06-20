import { Request, Response, NextFunction } from 'express';
import { CatalogService } from '../services/catalog.service';

export class CatalogController {
  static async getCatalogItems(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const categoryId = req.query.category_id ? parseInt(req.query.category_id as string) : undefined;
      const status = req.query.status as string;

      const result = await CatalogService.getCatalogItems(page, limit, search, categoryId, status);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async getCatalogItemById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const data = await CatalogService.getCatalogItemById(id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createCatalogItem(req: Request, res: Response, next: NextFunction) {
    try {
      const createdBy = Number((req as any).user?.userId);
      const data = await CatalogService.createCatalogItem(req.body, createdBy);
      res.status(201).json({ success: true, code: 'MSG-CAT-01', message: 'Tạo hàng hóa thành công', data });
    } catch (error) {
      next(error);
    }
  }

  static async updateCatalogItem(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const data = await CatalogService.updateCatalogItem(id, req.body);
      res.status(200).json({ success: true, code: 'MSG-CAT-05', message: 'Cập nhật hàng hóa thành công', data });
    } catch (error) {
      next(error);
    }
  }

  static async updateCatalogItemStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const data = await CatalogService.updateCatalogItemStatus(id, status);
      res.status(200).json({ success: true, code: 'MSG-CAT-06', message: 'Đã cập nhật trạng thái hàng hóa', data });
    } catch (error) {
      next(error);
    }
  }

  static async getCatalogCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CatalogService.getCatalogCategories();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createCatalogCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const createdBy = Number((req as any).user?.userId);
      const data = await CatalogService.createCatalogCategory(req.body, createdBy);
      res.status(201).json({ success: true, code: 'MSG-CAT-07', message: 'Tạo danh mục thành công', data });
    } catch (error) {
      next(error);
    }
  }

  static async updateCatalogCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const data = await CatalogService.updateCatalogCategory(id, req.body);
      res.status(200).json({ success: true, message: 'Cập nhật danh mục thành công', data });
    } catch (error) {
      next(error);
    }
  }

  static async getItemPriceHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const data = await CatalogService.getItemPriceHistory(id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async setItemPrice(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const createdBy = Number((req as any).user?.userId);
      const { price, valid_from } = req.body;
      const data = await CatalogService.setItemPrice(id, price, valid_from, createdBy);
      res.status(201).json({ success: true, code: 'MSG-SP-01', message: 'Thiết lập giá thành công', data });
    } catch (error) {
      next(error);
    }
  }
}