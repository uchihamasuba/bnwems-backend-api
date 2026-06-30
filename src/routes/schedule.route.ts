import { Router } from 'express';
import { Request, Response } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

export const getSchedules = async (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: 'Not Implemented' });
};

router.get('/', authorizeRoles('ADMIN', 'MANAGER', 'LEADER_STAFF'), getSchedules);

export default router;
