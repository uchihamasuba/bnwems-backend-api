import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);
router.use(authorizeRoles('admin', 'manager')); // Default for all reports

// Dashboard
router.get('/dashboard/admin', authorizeRoles('admin'), ReportController.getAdminDashboard);
router.get('/dashboard/operations', authorizeRoles('admin', 'manager'), ReportController.getOperationsDashboard);

// Reports
router.get('/reports/revenue', authorizeRoles('admin'), ReportController.getRevenueReport);
router.get('/reports/orders', ReportController.getOrdersReport);
router.get('/reports/inventory', ReportController.getInventoryReport);
router.get('/reports/staff', ReportController.getStaffReport);
router.get('/reports/warehouse-returns', ReportController.getWarehouseReturnsReport);
router.get('/reports/supplier-debt', authorizeRoles('admin'), ReportController.getSupplierDebtReport);
router.get('/reports/wages', authorizeRoles('admin', 'manager'), ReportController.getWagesReport);

export default router;