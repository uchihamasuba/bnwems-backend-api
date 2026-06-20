import { Router } from 'express';
import { SupplierController } from '../controllers/supplier.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Suppliers (CRUD)
router.get('/suppliers', SupplierController.getSuppliers);
router.post('/suppliers', authorizeRoles('Admin'), SupplierController.createSupplier);
router.put('/suppliers/:id', authorizeRoles('Admin'), SupplierController.updateSupplier);
router.patch('/suppliers/:id/status', authorizeRoles('Admin'), SupplierController.updateSupplierStatus);

// Supplier Payables
router.get('/supplier-payables', authorizeRoles('Manager', 'Admin', 'leader_staff'), SupplierController.getSupplierPayables);
router.post('/supplier-payables', authorizeRoles('Manager', 'Admin', 'leader_staff'), SupplierController.createSupplierPayable);
router.patch('/supplier-payables/:id/receipt', authorizeRoles('Manager', 'Admin', 'leader_staff'), SupplierController.receiptSupplierPayable);

// Supplier Payments
router.post('/supplier-payments', authorizeRoles('Manager', 'Admin'), SupplierController.createSupplierPayment);

export default router;