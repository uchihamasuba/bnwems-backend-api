import { Router } from 'express';
import * as equipmentController from '../controllers/equipment.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { getEquipmentsSchema, getEquipmentByIdSchema, createEquipmentSchema, updateEquipmentSchema, deactivateEquipmentSchema } from '../validators/equipment.validator';

const router = Router();

router.get('/', validate(getEquipmentsSchema), equipmentController.getEquipments);
router.get('/:id', validate(getEquipmentByIdSchema), equipmentController.getEquipmentById);

router.post('/', authenticate, authorizeRoles('ADMIN', 'MANAGER'), validate(createEquipmentSchema), equipmentController.createEquipment);
router.put('/:id', authenticate, authorizeRoles('ADMIN', 'MANAGER'), validate(updateEquipmentSchema), equipmentController.updateEquipment);
router.patch('/:id/status', authenticate, authorizeRoles('ADMIN', 'MANAGER'), validate(deactivateEquipmentSchema), equipmentController.deactivateEquipment);

export default router;
