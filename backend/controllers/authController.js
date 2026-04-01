import AuthService from '../services/authService.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Auth Controller — handles HTTP layer for authentication endpoints.
 */
class AuthController {
  /**
   * POST /api/auth/register
   */
  static async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const result = await AuthService.register({ name, email, password });
      ApiResponse.created('User registered successfully.', result).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      ApiResponse.ok('Login successful.', result).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   */
  static async getProfile(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user._id);
      ApiResponse.ok('Profile retrieved.', user).send(res);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
