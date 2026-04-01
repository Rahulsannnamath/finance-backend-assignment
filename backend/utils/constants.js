/**
 * Application-wide constants for roles, transaction types, and categories.
 */

export const ROLES = {
  VIEWER: 'viewer',
  ANALYST: 'analyst',
  ADMIN: 'admin',
};

export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

export const CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Food',
  'Transport',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Shopping',
  'Rent',
  'Insurance',
  'Savings',
  'Gifts',
  'Other',
];

/**
 * Role hierarchy — higher number = more privilege.
 * Used for comparison-based access checks.
 */
export const ROLE_HIERARCHY = {
  [ROLES.VIEWER]: 1,
  [ROLES.ANALYST]: 2,
  [ROLES.ADMIN]: 3,
};
