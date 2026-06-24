import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { quotationService } from '../services/quotation.service';

export const getQuotationsByOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { quotations, totalCount } = await quotationService.getQuotationsByOrder(orderId, page, limit);

    res.status(200).json({
      success: true,
      data: quotations,
      meta: { page, limit, totalCount },
    });
  } catch (error) {
    next(error);
  }
};

export const getQuotationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const quotation = await quotationService.getQuotationById(id);

    res.status(200).json({
      success: true,
      data: quotation,
    });
  } catch (error) {
    next(error);
  }
};

export const createQuotation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const actionUserId = req.user!.userId;
    const newQuote = await quotationService.createQuotation(orderId, req.body, actionUserId);

    res.status(201).json({
      success: true,
      message: 'Quotation created.',
      data: { id: newQuote.id, version: newQuote.version },
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuotation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await quotationService.updateQuotation(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Quotation updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuotation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await quotationService.deleteQuotation(id);

    res.status(200).json({
      success: true,
      message: 'Quotation deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const confirmQuotation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const actionUserId = req.user!.userId;

    await quotationService.confirmQuotation(id, actionUserId);

    res.status(200).json({
      success: true,
      message: 'Quotation confirmed.',
      data: { status: 'ACCEPTED' },
    });
  } catch (error) {
    next(error);
  }
};
