import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { ROLES } from '../utils/constants.js';

/**
 * User Service — admin-level user management operations.
 */
class UserService {
  /**
   * List all users with pagination.
   */
  static async listUsers({ page = 1, limit = 10, role, isActive }) {
    const filter = {};

    if (role && Object.values(ROLES).includes(role)) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true' || isActive === true;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single user by ID.
   */
  static async getUserById(id) {
    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }
    return user;
  }

  /**
   * Update a user (role, status, name).
   * Prevents admins from demoting themselves.
   */
  static async updateUser(id, updates, requestingUserId) {
    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    // Prevent self-demotion
    if (id === requestingUserId.toString() && updates.role && updates.role !== user.role) {
      throw ApiError.badRequest('You cannot change your own role.');
    }

    // Validate role if provided
    if (updates.role && !Object.values(ROLES).includes(updates.role)) {
      throw ApiError.badRequest(`Invalid role. Must be one of: ${Object.values(ROLES).join(', ')}`);
    }

    // Only allow specific fields to be updated
    const allowedUpdates = ['name', 'role', 'isActive'];
    const filteredUpdates = {};
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, filteredUpdates, {
      new: true,
      runValidators: true,
    });

    return updatedUser;
  }

  /**
   * Deactivate a user (soft delete).
   * Prevents admins from deactivating themselves.
   */
  static async deactivateUser(id, requestingUserId) {
    if (id === requestingUserId.toString()) {
      throw ApiError.badRequest('You cannot deactivate your own account.');
    }

    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    user.isActive = false;
    await user.save();

    return user;
  }
}

export default UserService;
