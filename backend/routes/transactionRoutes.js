import { Router } from 'express';
import { body, param, query } from 'express-validator';
import TransactionController from '../controllers/transactionController.js';
import authenticate from '../middleware/auth.js';
import { authorize, authorizeMinRole } from '../middleware/rbac.js';
import validate from '../middleware/validate.js';
import { ROLES, TRANSACTION_TYPES, CATEGORIES } from '../utils/constants.js';

const router = Router();

// All transaction routes require authentication
router.use(authenticate);

/**
 * POST /api/transactions
 * Admin only — create a new financial record.
 */
router.post(
  '/',
  authorize(ROLES.ADMIN),
  [
    body('amount')
      .notEmpty().withMessage('Amount is required')
      .isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('type')
      .notEmpty().withMessage('Type is required')
      .isIn(Object.values(TRANSACTION_TYPES))
      .withMessage('Type must be either income or expense'),
    body('category')
      .notEmpty().withMessage('Category is required')
      .isIn(CATEGORIES)
      .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
    body('date')
      .optional()
      .isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Description must be at most 500 characters'),
  ],
  validate,
  TransactionController.create
);

/**
 * GET /api/transactions
 * All authenticated users — list transactions with filters.
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100'),
    query('type').optional().isIn(Object.values(TRANSACTION_TYPES)).withMessage('Invalid type filter'),
    query('category').optional().isIn(CATEGORIES).withMessage('Invalid category filter'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
    query('sortBy').optional().isIn(['date', 'amount', 'createdAt']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  ],
  validate,
  TransactionController.list
);

/**
 * GET /api/transactions/:id
 * All authenticated users — get a single transaction.
 */
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid transaction ID format')],
  validate,
  TransactionController.getById
);

/**
 * PATCH /api/transactions/:id
 * Admin only — update a transaction.
 */
router.patch(
  '/:id',
  authorize(ROLES.ADMIN),
  [
    param('id').isMongoId().withMessage('Invalid transaction ID format'),
    body('amount')
      .optional()
      .isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('type')
      .optional()
      .isIn(Object.values(TRANSACTION_TYPES))
      .withMessage('Type must be either income or expense'),
    body('category')
      .optional()
      .isIn(CATEGORIES)
      .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
    body('date')
      .optional()
      .isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Description must be at most 500 characters'),
  ],
  validate,
  TransactionController.update
);

/**
 * DELETE /api/transactions/:id
 * Admin only — soft-delete a transaction.
 */
router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  [param('id').isMongoId().withMessage('Invalid transaction ID format')],
  validate,
  TransactionController.remove
);

export default router;
