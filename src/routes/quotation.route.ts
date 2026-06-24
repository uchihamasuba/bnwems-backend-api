import { Router } from 'express';
import * as quotationController from '../controllers/quotation.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(authorizeRoles('ADMIN', 'MANAGER'));

// Mounted on /api/v1/orders/:orderId/quotations or /api/v1/quotations
router.get('/', quotationController.getQuotationsByOrder);
router.get('/:id', quotationController.getQuotationById);
router.post('/', quotationController.createQuotation);
router.put('/:id', quotationController.updateQuotation);
router.delete('/:id', quotationController.deleteQuotation);
router.put('/:id/confirm', quotationController.confirmQuotation);

export default router;
