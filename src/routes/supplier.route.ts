import { Router } from 'express';
import * as supplierController from '../controllers/supplier.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN', 'MANAGER'));

// Suppliers
router.get('/', supplierController.getSuppliers);
router.post('/', supplierController.createSupplier);

export default router;
