import { Router } from 'express';
import { body } from 'express-validator';
import AuthController from '../controllers/authController.js';
import authenticate from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

/**
 * POST /api/auth/register
 * Public — create a new user account.
 */
router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  AuthController.register
);

/**
 * POST /api/auth/login
 * Public — authenticate and receive a JWT.
 */
router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required'),
  ],
  validate,
  AuthController.login
);

/**
 * GET /api/auth/me
 * Protected — get the authenticated user's profile.
 */
router.get('/me', authenticate, AuthController.getProfile);

export default router;
