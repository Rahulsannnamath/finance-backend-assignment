import Transaction from '../models/Transaction.js';
import ApiError from '../utils/ApiError.js';

/**
 * Transaction Service — business logic for financial records.
 */
class TransactionService {
  /**
   * Create a new financial record.
   */
  static async create(data, userId) {
    const transaction = await Transaction.create({
      ...data,
      user: userId,
    });
    return transaction;
  }

  /**
   * List transactions with filtering, sorting, and pagination.
   *
   * Supported filters: type, category, startDate, endDate, search (description)
   */
  static async list({
    page = 1,
    limit = 10,
    type,
    category,
    startDate,
    endDate,
    search,
    sortBy = 'date',
    sortOrder = 'desc',
  }) {
    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;

    // Date range filtering
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Text search on description
    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('user', 'name email role')
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(Number(limit)),
      Transaction.countDocuments(filter),
    ]);

    return {
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single transaction by ID.
   */
  static async getById(id) {
    const transaction = await Transaction.findById(id).populate('user', 'name email role');
    if (!transaction) {
      throw ApiError.notFound('Transaction not found.');
    }
    return transaction;
  }

  /**
   * Update a transaction.
   */
  static async update(id, updates) {
    const allowedUpdates = ['amount', 'type', 'category', 'date', 'description'];
    const filteredUpdates = {};
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    const transaction = await Transaction.findByIdAndUpdate(id, filteredUpdates, {
      new: true,
      runValidators: true,
    }).populate('user', 'name email role');

    if (!transaction) {
      throw ApiError.notFound('Transaction not found.');
    }

    return transaction;
  }

  /**
   * Soft-delete a transaction.
   */
  static async softDelete(id) {
    const transaction = await Transaction.findById(id).select('+isDeleted');
    if (!transaction) {
      throw ApiError.notFound('Transaction not found.');
    }

    transaction.isDeleted = true;
    await transaction.save();

    return { message: 'Transaction deleted successfully.' };
  }
}

export default TransactionService;
