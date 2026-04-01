import { Router } from 'express';
import { body, param } from 'express-validator';
import UserController from '../controllers/userController.js';
import authenticate from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import validate from '../middleware/validate.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

// All user management routes require authentication + admin role
router.use(authenticate, authorize(ROLES.ADMIN));

/**
 * GET /api/users
 * Admin — list all users with optional filters.
 */
router.get('/', UserController.listUsers);

/**
 * GET /api/users/:id
 * Admin — get a single user by ID.
 */
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid user ID format')],
  validate,
  UserController.getUser
);

/**
 * PATCH /api/users/:id
 * Admin — update user role, status, or name.
 */
router.patch(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid user ID format'),
    body('role')
      .optional()
      .isIn(Object.values(ROLES))
      .withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be 2–100 characters'),
  ],
  validate,
  UserController.updateUser
);

/**
 * DELETE /api/users/:id
 * Admin — deactivate a user.
 */
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid user ID format')],
  validate,
  UserController.deactivateUser
);

export default router;
