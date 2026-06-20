import { Router } from 'express';
import * as roleController from '../controllers/role.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);
router.use(authorizeRoles('Admin'));

router.get('/', roleController.getAllRoles);
router.post('/', roleController.createRole);
router.put('/:id', roleController.updateRole);
router.patch('/:id/status', roleController.updateRoleStatus);
router.get('/:id/users', roleController.getUsersByRole);
router.put('/:id/permissions', roleController.assignPermissions);

export default router;
