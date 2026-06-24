import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { catalogService } from '../services/catalog.service';

export const getCatalogItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const itemType = req.query.itemType as string;
    const isActiveParam = req.query.isActive as string;

    const { items, totalCount } = await catalogService.getCatalogItems(page, limit, search, itemType, isActiveParam);

    res.status(200).json({
      success: true,
      data: items,
      meta: { page, limit, totalCount },
    });
  } catch (error) {
    next(error);
  }
};

export const getCatalogItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const item = await catalogService.getCatalogItemById(id);

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const createCatalogItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const actionUserId = req.user!.userId;
    const newItem = await catalogService.createCatalogItem(req.body, actionUserId);

    res.status(201).json({
      success: true,
      message: 'Catalog item created successfully.',
      data: newItem,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCatalogItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const actionUserId = req.user!.userId;

    await catalogService.updateCatalogItem(id, req.body, actionUserId);

    res.status(200).json({
      success: true,
      message: 'Catalog item updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateCatalogItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const actionUserId = req.user!.userId;

    await catalogService.deactivateCatalogItem(id, isActive, actionUserId);

    res.status(200).json({
      success: true,
      message: 'Catalog item status changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
