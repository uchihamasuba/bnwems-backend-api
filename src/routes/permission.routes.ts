import { Router } from 'express';
import * as roleController from '../controllers/role.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);
router.use(authorizeRoles('Admin'));

router.get('/', roleController.getAllPermissions);

export default router;
