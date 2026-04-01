import UserService from '../services/userService.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * User Controller — admin-level user management endpoints.
 */
class UserController {
  /**
   * GET /api/users
   */
  static async listUsers(req, res, next) {
    try {
      const { page, limit, role, isActive } = req.query;
      const result = await UserService.listUsers({ page, limit, role, isActive });
      ApiResponse.ok('Users retrieved.', result).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/:id
   */
  static async getUser(req, res, next) {
    try {
      const user = await UserService.getUserById(req.params.id);
      ApiResponse.ok('User retrieved.', user).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/users/:id
   */
  static async updateUser(req, res, next) {
    try {
      const user = await UserService.updateUser(req.params.id, req.body, req.user._id);
      ApiResponse.ok('User updated.', user).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/:id
   */
  static async deactivateUser(req, res, next) {
    try {
      const user = await UserService.deactivateUser(req.params.id, req.user._id);
      ApiResponse.ok('User deactivated.', user).send(res);
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
