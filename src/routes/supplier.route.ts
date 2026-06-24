import { Router } from 'express';
import * as supplierController from '../controllers/supplier.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { getSuppliersSchema, createSupplierSchema } from '../validators/supplier.validator';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN', 'MANAGER'));

// Suppliers
router.get('/', validate(getSuppliersSchema), supplierController.getSuppliers);
router.post('/', validate(createSupplierSchema), supplierController.createSupplier);

export default router;
