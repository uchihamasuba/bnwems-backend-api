import { Router } from 'express';
import { equipmentController } from '../controllers/equipment.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();
router.use(verifyToken);

// GET /api/v1/equipment
router.get('/', equipmentController.getEquipments);

export default router;
