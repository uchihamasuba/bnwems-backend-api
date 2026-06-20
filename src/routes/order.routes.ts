import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { QuotationController } from '../controllers/quotation.controller';
import { SurveyController } from '../controllers/survey.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);
router.get('/', authorizeRoles('admin', 'manager'), OrderController.getOrders);
router.get('/:id', authorizeRoles('admin', 'manager'), OrderController.getOrderById);
router.get('/:id/status-history', authorizeRoles('admin', 'manager'), OrderController.getStatusHistory);
router.post('/', authorizeRoles('admin', 'manager'), OrderController.createOrder);
router.put('/:id', authorizeRoles('admin', 'manager'), OrderController.updateOrder);
router.patch('/:id/confirm', authorizeRoles('admin', 'manager'), OrderController.confirmOrder);
router.post('/:id/change-date', authorizeRoles('admin', 'manager'), OrderController.changeDate);
router.post('/:id/cancel', authorizeRoles('admin', 'manager'), OrderController.cancelOrder);
router.get('/:id/items', authorizeRoles('admin', 'manager'), OrderController.getOrderItems);
router.post('/:id/items', authorizeRoles('admin', 'manager'), OrderController.addOrderItems);

router.get('/:id/quotations', authorizeRoles('admin', 'manager'), QuotationController.getQuotationsByOrder);
router.post('/:id/quotations', authorizeRoles('admin', 'manager'), QuotationController.createQuotation);

router.post('/:id/pick-lists', authorizeRoles('admin', 'manager'), OrderController.createPickList);
router.get('/:id/return-status', authorizeRoles('admin', 'manager'), OrderController.getReturnStatus);
router.post('/:id/confirm-return', authorizeRoles('admin', 'manager'), OrderController.confirmReturn);

router.post('/:id/surveys', authorizeRoles('admin', 'manager'), SurveyController.scheduleSurvey);
router.get('/:id/surveys', authorizeRoles('admin', 'manager'), SurveyController.getSurveysByOrder);
router.post('/:id/assignments', authorizeRoles('admin', 'manager'), OrderController.assignUser);

router.post('/:id/schedules', authorizeRoles('admin', 'manager'), OrderController.createSchedule);
router.get('/:id/progress', authorizeRoles('admin', 'manager'), OrderController.getProgress);
router.post('/:id/handovers', authorizeRoles('admin', 'manager', 'leader_staff'), OrderController.createHandover);
router.post('/:id/change-requests', authorizeRoles('admin', 'manager', 'leader_staff'), OrderController.createChangeRequest);
router.post('/:id/damage-loss-reports', authorizeRoles('admin', 'manager', 'leader_staff'), OrderController.createDamageLossReport);

router.post('/:id/deposit-request', authorizeRoles('admin', 'manager'), OrderController.createDepositRequest);
router.post('/:id/final-payment', authorizeRoles('admin', 'manager'), OrderController.recordFinalPayment);
router.get('/:id/payments', authorizeRoles('admin', 'manager', 'accountant'), OrderController.getPayments);
router.get('/:id/settlement', authorizeRoles('admin', 'manager', 'accountant'), OrderController.getSettlement);
router.put('/:id/settlement', authorizeRoles('admin', 'manager', 'leader_staff'), OrderController.updateSettlement);

export default router;