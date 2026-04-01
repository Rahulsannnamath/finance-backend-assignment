import { Router } from 'express';
import DashboardController from '../controllers/dashboardController.js';
import authenticate from '../middleware/auth.js';
import { authorizeMinRole } from '../middleware/rbac.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

// Dashboard routes require authentication + at least analyst role
router.use(authenticate, authorizeMinRole(ROLES.ANALYST));

/**
 * GET /api/dashboard/summary
 * Analyst & Admin — overall financial summary.
 */
router.get('/summary', DashboardController.getSummary);

/**
 * GET /api/dashboard/category-breakdown
 * Analyst & Admin — category-wise income/expense breakdown.
 */
router.get('/category-breakdown', DashboardController.getCategoryBreakdown);

/**
 * GET /api/dashboard/trends
 * Analyst & Admin — monthly income vs expense trends.
 */
router.get('/trends', DashboardController.getMonthlyTrends);

/**
 * GET /api/dashboard/recent
 * Analyst & Admin — recent transaction activity.
 */
router.get('/recent', DashboardController.getRecentActivity);

export default router;
