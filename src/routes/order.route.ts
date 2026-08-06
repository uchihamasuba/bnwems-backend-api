import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { inventoryController } from '../controllers/inventory.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  verifyToken as protect,
  authorizeRoles as restrictTo,
} from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import {
  getOrdersSchema,
  getOrderByIdSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  updateOrderItemsSchema,
  getOrderWarningsSchema,
  createOrderWarningSchema,
  resolveOrderWarningSchema,
  getOrderDepositsSchema,
  createOrderDepositSchema,
  updateDepositStatusSchema,
  getOrderSettlementSchema,
  createOrderSettlementSchema,
  confirmSettlementSchema,
} from '../validators/order.validator';

const router = Router();

// ============================================================================
// ORDERS
// ============================================================================

router.get(
  '/',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(getOrdersSchema),
  orderController.getOrders,
);

router.post(
  '/',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(createOrderSchema),
  orderController.createOrder,
);

router.get(
  '/:id',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER, Role.TECHNICAL),
  validate(getOrderByIdSchema),
  orderController.getOrderById,
);

router.put(
  '/:id/status',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus,
);

router.put(
  '/:id/items',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(updateOrderItemsSchema),
  orderController.updateOrderItems,
);

// ============================================================================
// ORDER WARNINGS
// ============================================================================

router.get(
  '/:id/warnings',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER, Role.TECHNICAL, Role.LEADER),
  validate(getOrderWarningsSchema),
  orderController.getOrderWarnings,
);

router.post(
  '/:id/warnings',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER, Role.TECHNICAL, Role.LEADER),
  validate(createOrderWarningSchema),
  orderController.createOrderWarning,
);

// ============================================================================
// DEPOSITS
// ============================================================================

router.get(
  '/:id/deposits',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(getOrderDepositsSchema),
  orderController.getOrderDeposits,
);

router.post(
  '/:id/deposits',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(createOrderDepositSchema),
  orderController.createOrderDeposit,
);

// ============================================================================
// SETTLEMENTS
// ============================================================================

router.get(
  '/:id/settlement',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER, Role.LEADER),
  validate(getOrderSettlementSchema),
  orderController.getOrderSettlement,
);

router.post(
  '/:id/settlement',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER, Role.LEADER),
  validate(createOrderSettlementSchema),
  orderController.createOrderSettlement,
);

// ============================================================================
// INVENTORY PREPARATION & CHECKOUT
// ============================================================================

router.put(
  '/:id/prepare',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  inventoryController.prepareOrder,
);

router.post(
  '/:id/checkout',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  inventoryController.checkoutOrder,
);

export default router;
