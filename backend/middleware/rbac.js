import ApiError from '../utils/ApiError.js';
import { ROLE_HIERARCHY } from '../utils/constants.js';

/**
 * Role-Based Access Control middleware factory.
 *
 * @param  {...string} allowedRoles - Roles permitted to access the route
 * @returns {Function} Express middleware
 *
 * Usage:
 *   authorize('admin')            → only admins
 *   authorize('analyst', 'admin') → analysts and admins
 */
const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required before authorization.'));
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return next(
        ApiError.forbidden(
          `Role '${userRole}' is not authorized to perform this action. Required: ${allowedRoles.join(' or ')}.`
        )
      );
    }

    next();
  };
};

/**
 * Minimum-role middleware — allows any user whose role is at or above
 * the specified level in the hierarchy.
 *
 * @param {string} minimumRole - The minimum role required
 */
const authorizeMinRole = (minimumRole) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;

    if (userLevel < requiredLevel) {
      return next(
        ApiError.forbidden(
          `Minimum role '${minimumRole}' is required. Your role: '${req.user.role}'.`
        )
      );
    }

    next();
  };
};

export { authorize, authorizeMinRole };
