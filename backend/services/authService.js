import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

/**
 * Auth Service — handles registration, login, and token generation.
 */
class AuthService {
  /**
   * Generate a JWT token for the given user ID.
   */
  static generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  }

  /**
   * Register a new user.
   * By default, new users are created with the 'viewer' role.
   */
  static async register({ name, email, password }) {
    // Check if email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('A user with this email already exists.');
    }

    const user = await User.create({ name, email, password });
    const token = AuthService.generateToken(user._id);

    return {
      user: user.toJSON(),
      token,
    };
  }

  /**
   * Log in an existing user.
   */
  static async login({ email, password }) {
    // Explicitly select password since it's excluded by default
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated. Contact an admin.');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const token = AuthService.generateToken(user._id);

    return {
      user: user.toJSON(),
      token,
    };
  }

  /**
   * Get the current user's profile.
   */
  static async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }
    return user;
  }
}

export default AuthService;
