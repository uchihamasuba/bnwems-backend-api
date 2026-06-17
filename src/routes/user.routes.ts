import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';

const router = Router();

// All routes require valid JWT + Admin role
router.use(verifyToken, requireRole('Administrator'));

// GET /api/v1/admin/users
router.get('/', userController.getUsers);

// POST /api/v1/admin/users
router.post('/', validateBody(['username', 'password', 'fullName', 'email', 'phone', 'roleId']), userController.createUser);

// DELETE /api/v1/admin/users/:id
router.delete('/:id', userController.deactivateUser);

export default router;
