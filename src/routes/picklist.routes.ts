import { Router } from 'express';
import { PickListController } from '../controllers/picklist.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);
router.post('/:id/checkout', authorizeRoles('admin', 'manager', 'leader_staff'), PickListController.checkoutPickList);
router.get('/', authorizeRoles('admin', 'manager', 'leader_staff'), PickListController.getPickLists);

export default router;
