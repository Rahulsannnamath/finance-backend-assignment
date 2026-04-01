import DashboardService from '../services/dashboardService.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Dashboard Controller — analytics and summary endpoints.
 */
class DashboardController {
  /**
   * GET /api/dashboard/summary
   * Returns total income, total expenses, net balance, and record count.
   */
  static async getSummary(_req, res, next) {
    try {
      const summary = await DashboardService.getSummary();
      ApiResponse.ok('Dashboard summary retrieved.', summary).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/category-breakdown
   * Returns income/expense breakdown by category.
   */
  static async getCategoryBreakdown(_req, res, next) {
    try {
      const breakdown = await DashboardService.getCategoryBreakdown();
      ApiResponse.ok('Category breakdown retrieved.', breakdown).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/trends
   * Returns monthly income vs expense trends (last 12 months).
   */
  static async getMonthlyTrends(_req, res, next) {
    try {
      const trends = await DashboardService.getMonthlyTrends();
      ApiResponse.ok('Monthly trends retrieved.', trends).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/recent
   * Returns recent transactions.
   */
  static async getRecentActivity(req, res, next) {
    try {
      const limit = req.query.limit || 10;
      const activity = await DashboardService.getRecentActivity(limit);
      ApiResponse.ok('Recent activity retrieved.', activity).send(res);
    } catch (error) {
      next(error);
    }
  }
}

export default DashboardController;
