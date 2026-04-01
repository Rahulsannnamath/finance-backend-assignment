import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Validation middleware — runs after express-validator checks.
 * Collects all validation errors and throws a structured ApiError.
 */
const validate = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return next(ApiError.badRequest('Validation failed', extractedErrors));
  }

  next();
};

export default validate;
