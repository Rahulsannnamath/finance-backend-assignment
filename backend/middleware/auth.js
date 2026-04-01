import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

/**
 * Authentication middleware.
 * Verifies the JWT token from the Authorization header and attaches
 * the authenticated user to req.user.
 */
const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided. Please log in.');
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Token expired. Please log in again.');
      }
      throw ApiError.unauthorized('Invalid token.');
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      throw ApiError.unauthorized('User belonging to this token no longer exists.');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated. Contact an admin.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
