import { Router } from 'express';
import * as suppliertxController from '../controllers/suppliertx.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN', 'MANAGER'));

// Supplier Transactions
router.post('/supplier-transactions', suppliertxController.createSupplierTransaction);
router.put('/supplier-transactions/:id/receive', suppliertxController.receiveSupplierItems);
router.put('/supplier-transactions/:id/return', suppliertxController.returnSupplierItems);

// Supplier Debts
router.get('/supplier-debts', suppliertxController.getSupplierDebts);
router.post('/supplier-debts/:id/pay', suppliertxController.paySupplierDebt);

export default router;
