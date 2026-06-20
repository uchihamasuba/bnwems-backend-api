import { Router } from 'express';
import { QuotationController } from '../controllers/quotation.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);
router.get('/:id', authorizeRoles('admin', 'manager'), QuotationController.getQuotationById);
router.put('/:id', authorizeRoles('admin', 'manager'), QuotationController.updateQuotation);
router.post('/:id/approve', authorizeRoles('admin', 'manager'), QuotationController.approveQuotation);

export default router;