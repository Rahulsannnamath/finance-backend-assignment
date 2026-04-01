import Transaction from '../models/Transaction.js';

/**
 * Dashboard Service — aggregation pipelines for analytics and summaries.
 */
class DashboardService {
  /**
   * Overall summary: total income, total expenses, net balance, record count.
   */
  static async getSummary() {
    const result = await Transaction.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
          totalRecords: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalIncome: { $round: ['$totalIncome', 2] },
          totalExpenses: { $round: ['$totalExpenses', 2] },
          netBalance: { $round: [{ $subtract: ['$totalIncome', '$totalExpenses'] }, 2] },
          totalRecords: 1,
        },
      },
    ]);

    return (
      result[0] || {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        totalRecords: 0,
      }
    );
  }

  /**
   * Category-wise breakdown with income/expense split.
   */
  static async getCategoryBreakdown() {
    const result = await Transaction.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.category',
          breakdown: {
            $push: {
              type: '$_id.type',
              total: { $round: ['$total', 2] },
              count: '$count',
            },
          },
          grandTotal: { $sum: '$total' },
        },
      },
      { $sort: { grandTotal: -1 } },
      {
        $project: {
          _id: 0,
          category: '$_id',
          breakdown: 1,
          grandTotal: { $round: ['$grandTotal', 2] },
        },
      },
    ]);

    return result;
  }

  /**
   * Monthly trends — income vs expense for each month (last 12 months).
   */
  static async getMonthlyTrends() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const result = await Transaction.aggregate([
      {
        $match: {
          isDeleted: { $ne: true },
          date: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: { year: '$_id.year', month: '$_id.month' },
          data: {
            $push: {
              type: '$_id.type',
              total: { $round: ['$total', 2] },
              count: '$count',
            },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          data: 1,
        },
      },
    ]);

    return result;
  }

  /**
   * Recent activity — last N transactions.
   */
  static async getRecentActivity(limit = 10) {
    const transactions = await Transaction.find({ isDeleted: { $ne: true } })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return transactions;
  }
}

export default DashboardService;
