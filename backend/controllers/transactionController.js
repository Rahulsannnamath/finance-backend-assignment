import TransactionService from '../services/transactionService.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Transaction Controller — CRUD endpoints for financial records.
 */
class TransactionController {
  /**
   * POST /api/transactions
   */
  static async create(req, res, next) {
    try {
      const transaction = await TransactionService.create(req.body, req.user._id);
      ApiResponse.created('Transaction created.', transaction).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/transactions
   */
  static async list(req, res, next) {
    try {
      const result = await TransactionService.list(req.query);
      ApiResponse.ok('Transactions retrieved.', result).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/transactions/:id
   */
  static async getById(req, res, next) {
    try {
      const transaction = await TransactionService.getById(req.params.id);
      ApiResponse.ok('Transaction retrieved.', transaction).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/transactions/:id
   */
  static async update(req, res, next) {
    try {
      const transaction = await TransactionService.update(req.params.id, req.body);
      ApiResponse.ok('Transaction updated.', transaction).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/transactions/:id
   */
  static async remove(req, res, next) {
    try {
      const result = await TransactionService.softDelete(req.params.id);
      ApiResponse.ok(result.message).send(res);
    } catch (error) {
      next(error);
    }
  }
}

export default TransactionController;
