import { Request, Response, NextFunction } from 'express';
import { catalogCategoryService, catalogItemService } from '../services/catalog.service';

// ============================================================================
// CATALOG CATEGORY
// ============================================================================

export const getCatalogCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    
    let isActive: boolean | undefined = undefined;
    if (req.query.isActive === 'true') isActive = true;
    if (req.query.isActive === 'false') isActive = false;

    const { categories, totalCount } = await catalogCategoryService.getCatalogCategories(page, limit, search, isActive);

    res.status(200).json({
      success: true,
      data: categories,
      meta: { page, limit, totalCount },
    });
  } catch (error) {
    next(error);
  }
};

export const getCatalogCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await catalogCategoryService.getCatalogCategoryById(id);

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const createCatalogCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newCategory = await catalogCategoryService.createCatalogCategory(req.body);

    res.status(201).json({
      success: true,
      message: 'Catalog category created successfully',
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCatalogCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedCategory = await catalogCategoryService.updateCatalogCategory(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Catalog category updated successfully',
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCatalogCategoryStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    await catalogCategoryService.updateCatalogCategoryStatus(id, isActive);

    res.status(200).json({
      success: true,
      message: 'Catalog category status updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// CATALOG ITEM
// ============================================================================

export const getCatalogItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const itemType = req.query.itemType as string;
    const categoryId = req.query.categoryId as string;

    let isActive: boolean | undefined = undefined;
    if (req.query.isActive === 'true') isActive = true;
    if (req.query.isActive === 'false') isActive = false;

    const { items, totalCount } = await catalogItemService.getCatalogItems(page, limit, search, itemType, categoryId, isActive);

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
    const item = await catalogItemService.getCatalogItemById(id);

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const createCatalogItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newItem = await catalogItemService.createCatalogItem(req.body);

    res.status(201).json({
      success: true,
      message: 'Catalog item created successfully',
      data: newItem,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCatalogItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedItem = await catalogItemService.updateCatalogItem(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Catalog item updated successfully',
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCatalogItemStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    await catalogItemService.updateCatalogItemStatus(id, isActive);

    res.status(200).json({
      success: true,
      message: 'Catalog item status updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
