import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Dashboard API',
      version: '1.0.0',
      description: `
## Finance Dashboard REST API

A robust backend for managing financial records with **Role-Based Access Control (RBAC)**, 
JWT authentication, and rich analytics endpoints.

### Roles & Permissions
| Role      | Permissions                                          |
|-----------|------------------------------------------------------|
| \`viewer\`  | Read transactions, read own profile                  |
| \`analyst\` | All viewer permissions + dashboard analytics         |
| \`admin\`   | Full access — create/update/delete transactions & users |

### Authentication
All protected routes require a **Bearer JWT token** in the Authorization header:
\`\`\`
Authorization: Bearer <your_token>
\`\`\`
Get a token by calling \`POST /api/auth/login\`.
      `,
      contact: {
        name: 'Rahul Sannamath',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
    ],
    tags: [
      { name: 'Health', description: 'API health & status check' },
      { name: 'Auth', description: 'Register, login, and profile endpoints' },
      { name: 'Transactions', description: 'CRUD operations on financial records' },
      { name: 'Dashboard', description: 'Analytics and summary endpoints (analyst+ only)' },
      { name: 'Users', description: 'Admin-level user management' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from POST /api/auth/login',
        },
      },
      schemas: {
        // ─── Enums ───
        Role: {
          type: 'string',
          enum: ['viewer', 'analyst', 'admin'],
          example: 'viewer',
        },
        TransactionType: {
          type: 'string',
          enum: ['income', 'expense'],
          example: 'expense',
        },
        Category: {
          type: 'string',
          enum: [
            'Salary', 'Freelance', 'Investment', 'Food', 'Transport',
            'Utilities', 'Entertainment', 'Healthcare', 'Education',
            'Shopping', 'Rent', 'Insurance', 'Savings', 'Gifts', 'Other',
          ],
          example: 'Food',
        },

        // ─── User ───
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '661f1b2e3c4d5e6f7a8b9c0d' },
            name: { type: 'string', example: 'Alice Johnson' },
            email: { type: 'string', format: 'email', example: 'alice@example.com' },
            role: { $ref: '#/components/schemas/Role' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-03-20T14:00:00Z' },
          },
        },

        // ─── Transaction ───
        Transaction: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '662a2c3d4e5f6a7b8c9d0e1f' },
            user: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: '661f1b2e3c4d5e6f7a8b9c0d' },
                name: { type: 'string', example: 'Alice Johnson' },
                email: { type: 'string', example: 'alice@example.com' },
                role: { $ref: '#/components/schemas/Role' },
              },
            },
            amount: { type: 'number', format: 'float', example: 1250.00 },
            type: { $ref: '#/components/schemas/TransactionType' },
            category: { $ref: '#/components/schemas/Category' },
            date: { type: 'string', format: 'date-time', example: '2024-03-01T00:00:00Z' },
            description: { type: 'string', example: 'Monthly grocery run' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-03-01T09:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-03-01T09:00:00Z' },
          },
        },

        // ─── Pagination ───
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 58 },
            pages: { type: 'integer', example: 6 },
          },
        },

        // ─── Request Bodies ───
        RegisterBody: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 100, example: 'Alice Johnson' },
            email: { type: 'string', format: 'email', example: 'alice@example.com' },
            password: { type: 'string', minLength: 6, example: 'securePass123' },
          },
        },
        LoginBody: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'alice@example.com' },
            password: { type: 'string', example: 'securePass123' },
          },
        },
        CreateTransactionBody: {
          type: 'object',
          required: ['amount', 'type', 'category'],
          properties: {
            amount: { type: 'number', minimum: 0.01, example: 4500.00 },
            type: { $ref: '#/components/schemas/TransactionType' },
            category: { $ref: '#/components/schemas/Category' },
            date: { type: 'string', format: 'date', example: '2024-03-15' },
            description: { type: 'string', maxLength: 500, example: 'March salary payment' },
          },
        },
        UpdateTransactionBody: {
          type: 'object',
          properties: {
            amount: { type: 'number', minimum: 0.01, example: 5000.00 },
            type: { $ref: '#/components/schemas/TransactionType' },
            category: { $ref: '#/components/schemas/Category' },
            date: { type: 'string', format: 'date', example: '2024-03-20' },
            description: { type: 'string', maxLength: 500, example: 'Updated description' },
          },
        },
        UpdateUserBody: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 100, example: 'Alice Smith' },
            role: { $ref: '#/components/schemas/Role' },
            isActive: { type: 'boolean', example: false },
          },
        },

        // ─── Generic Responses ───
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful.' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Something went wrong.' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Must be a valid email address' },
                },
              },
            },
          },
        },

        // ─── Auth Response ───
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful.' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
              },
            },
          },
        },

        // ─── Dashboard Schemas ───
        DashboardSummary: {
          type: 'object',
          properties: {
            totalIncome: { type: 'number', example: 85000.00 },
            totalExpenses: { type: 'number', example: 42300.50 },
            netBalance: { type: 'number', example: 42699.50 },
            totalRecords: { type: 'integer', example: 124 },
          },
        },
        CategoryBreakdownItem: {
          type: 'object',
          properties: {
            category: { type: 'string', example: 'Food' },
            grandTotal: { type: 'number', example: 5200.00 },
            breakdown: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { $ref: '#/components/schemas/TransactionType' },
                  total: { type: 'number', example: 5200.00 },
                  count: { type: 'integer', example: 18 },
                },
              },
            },
          },
        },
        MonthlyTrendItem: {
          type: 'object',
          properties: {
            year: { type: 'integer', example: 2024 },
            month: { type: 'integer', example: 3 },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { $ref: '#/components/schemas/TransactionType' },
                  total: { type: 'number', example: 4500.00 },
                  count: { type: 'integer', example: 12 },
                },
              },
            },
          },
        },
      },

      // ─── Reusable Response Objects ───
      responses: {
        Unauthorized: {
          description: '401 — Missing or invalid JWT token',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, message: 'No token provided. Please log in.' },
            },
          },
        },
        Forbidden: {
          description: '403 — Authenticated but insufficient role',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, message: "Role 'viewer' is not authorized to perform this action." },
            },
          },
        },
        NotFound: {
          description: '404 — Resource does not exist',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, message: 'Resource not found.' },
            },
          },
        },
        ValidationError: {
          description: '422 — Request body / query param validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                message: 'Validation failed',
                errors: [
                  { field: 'email', message: 'Must be a valid email address' },
                  { field: 'password', message: 'Password must be at least 6 characters' },
                ],
              },
            },
          },
        },
      },

      // ─── Reusable Parameters ───
      parameters: {
        mongoId: {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', example: '662a2c3d4e5f6a7b8c9d0e1f' },
          description: 'MongoDB ObjectId',
        },
        page: {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1, default: 1 },
          description: 'Page number for pagination',
        },
        limit: {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          description: 'Number of items per page (max 100)',
        },
      },
    },

    // ─── Global security (can override per-route) ───
    security: [{ BearerAuth: [] }],

    paths: {
      // ════════════════════════════════════
      //  HEALTH
      // ════════════════════════════════════
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'API health check',
          description: 'Returns the running status of the API. No authentication required.',
          security: [],
          responses: {
            200: {
              description: 'API is running',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Finance Dashboard API is running' },
                      timestamp: { type: 'string', format: 'date-time' },
                      environment: { type: 'string', example: 'development' },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // ════════════════════════════════════
      //  AUTH
      // ════════════════════════════════════
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          description: 'Creates a new user account. New users are assigned the `viewer` role by default. No authentication required.',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterBody' },
              },
            },
          },
          responses: {
            201: {
              description: 'User created successfully — returns user object and JWT token',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
            409: {
              description: '409 — Email already registered',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: { success: false, message: 'A user with this email already exists.' },
                },
              },
            },
            422: { $ref: '#/components/responses/ValidationError' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login and receive a JWT',
          description: `Authenticates credentials and returns a signed JWT for use in subsequent requests.

> **📋 Pre-seeded test accounts** — click an example below to auto-fill credentials:
>
> | Role     | Email                    | Password     | Access level                          |
> |----------|--------------------------|--------------|---------------------------------------|
> | Admin    | admin@finance.com        | admin123     | Full access (read + write + analytics)|
> | Analyst  | analyst@finance.com      | analyst123   | Read + dashboard analytics            |
> | Viewer   | viewer@finance.com       | viewer123    | Read only (transactions)              |

Copy the JWT from the response \`data.token\` field and click the **Authorize 🔒** button at the top to authenticate all subsequent requests.`,
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginBody' },
                examples: {
                  admin: {
                    summary: '🔑 Admin — full access',
                    description: 'Can create, update, delete transactions and manage users.',
                    value: {
                      email: 'admin@finance.com',
                      password: 'admin123',
                    },
                  },
                  analyst: {
                    summary: '📊 Analyst — read + analytics',
                    description: 'Can view transactions and access all dashboard analytics endpoints.',
                    value: {
                      email: 'analyst@finance.com',
                      password: 'analyst123',
                    },
                  },
                  viewer: {
                    summary: '👁️ Viewer — read only',
                    description: 'Can only list and view individual transactions.',
                    value: {
                      email: 'viewer@finance.com',
                      password: 'viewer123',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful — copy `data.token` and click Authorize 🔒 at the top',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
            401: {
              description: '401 — Invalid email or password',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: { success: false, message: 'Invalid email or password.' },
                },
              },
            },
            422: { $ref: '#/components/responses/ValidationError' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user profile',
          description: "Returns the authenticated user's own profile. Requires a valid Bearer token.",
          responses: {
            200: {
              description: 'Profile retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Profile retrieved.' },
                      data: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
          },
        },
      },

      // ════════════════════════════════════
      //  TRANSACTIONS
      // ════════════════════════════════════
      '/api/transactions': {
        post: {
          tags: ['Transactions'],
          summary: 'Create a transaction (admin only)',
          description: 'Creates a new financial record. The `user` field is automatically set to the authenticated admin. Requires `admin` role.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateTransactionBody' },
              },
            },
          },
          responses: {
            201: {
              description: 'Transaction created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Transaction created.' },
                      data: { $ref: '#/components/schemas/Transaction' },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            422: { $ref: '#/components/responses/ValidationError' },
          },
        },
        get: {
          tags: ['Transactions'],
          summary: 'List transactions with filters & pagination',
          description: 'Returns a paginated list of transactions. All authenticated users can access this. Supports filtering by type, category, date range, and keyword search.',
          parameters: [
            { $ref: '#/components/parameters/page' },
            { $ref: '#/components/parameters/limit' },
            {
              in: 'query', name: 'type', schema: { $ref: '#/components/schemas/TransactionType' },
              description: 'Filter by transaction type',
            },
            {
              in: 'query', name: 'category', schema: { $ref: '#/components/schemas/Category' },
              description: 'Filter by category',
            },
            {
              in: 'query', name: 'startDate', schema: { type: 'string', format: 'date', example: '2024-01-01' },
              description: 'Filter transactions on or after this date (ISO 8601)',
            },
            {
              in: 'query', name: 'endDate', schema: { type: 'string', format: 'date', example: '2024-03-31' },
              description: 'Filter transactions on or before this date (ISO 8601)',
            },
            {
              in: 'query', name: 'search', schema: { type: 'string', example: 'grocery' },
              description: 'Case-insensitive keyword search on description',
            },
            {
              in: 'query', name: 'sortBy', schema: { type: 'string', enum: ['date', 'amount', 'createdAt'], default: 'date' },
              description: 'Field to sort by',
            },
            {
              in: 'query', name: 'sortOrder', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
              description: 'Sort direction',
            },
          ],
          responses: {
            200: {
              description: 'Paginated list of transactions',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Transactions retrieved.' },
                      data: {
                        type: 'object',
                        properties: {
                          transactions: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Transaction' },
                          },
                          pagination: { $ref: '#/components/schemas/Pagination' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            422: { $ref: '#/components/responses/ValidationError' },
          },
        },
      },
      '/api/transactions/{id}': {
        get: {
          tags: ['Transactions'],
          summary: 'Get a single transaction',
          description: 'Returns one transaction by its MongoDB ObjectId. All authenticated users can access this.',
          parameters: [{ $ref: '#/components/parameters/mongoId' }],
          responses: {
            200: {
              description: 'Transaction retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Transaction retrieved.' },
                      data: { $ref: '#/components/schemas/Transaction' },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
        patch: {
          tags: ['Transactions'],
          summary: 'Update a transaction (admin only)',
          description: 'Partially updates a transaction. Only `amount`, `type`, `category`, `date`, and `description` can be changed. Requires `admin` role.',
          parameters: [{ $ref: '#/components/parameters/mongoId' }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateTransactionBody' },
              },
            },
          },
          responses: {
            200: {
              description: 'Transaction updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Transaction updated.' },
                      data: { $ref: '#/components/schemas/Transaction' },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
            422: { $ref: '#/components/responses/ValidationError' },
          },
        },
        delete: {
          tags: ['Transactions'],
          summary: 'Soft-delete a transaction (admin only)',
          description: 'Marks a transaction as deleted without removing it from the database. The record is preserved but hidden from all subsequent queries. Requires `admin` role.',
          parameters: [{ $ref: '#/components/parameters/mongoId' }],
          responses: {
            200: {
              description: 'Transaction soft-deleted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Transaction deleted successfully.' },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
      },

      // ════════════════════════════════════
      //  DASHBOARD
      // ════════════════════════════════════
      '/api/dashboard/summary': {
        get: {
          tags: ['Dashboard'],
          summary: 'Overall financial summary',
          description: 'Returns aggregated totals: total income, total expenses, net balance, and record count across all non-deleted transactions. Requires `analyst` or `admin` role.',
          responses: {
            200: {
              description: 'Summary retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Dashboard summary retrieved.' },
                      data: { $ref: '#/components/schemas/DashboardSummary' },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
          },
        },
      },
      '/api/dashboard/category-breakdown': {
        get: {
          tags: ['Dashboard'],
          summary: 'Category-wise income/expense breakdown',
          description: 'Returns a breakdown of totals per category, with income and expense split. Sorted by grand total descending. Requires `analyst` or `admin` role.',
          responses: {
            200: {
              description: 'Category breakdown retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Category breakdown retrieved.' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/CategoryBreakdownItem' },
                      },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
          },
        },
      },
      '/api/dashboard/trends': {
        get: {
          tags: ['Dashboard'],
          summary: 'Monthly income vs expense trends (last 12 months)',
          description: 'Returns monthly aggregated income and expense totals for the past 12 months, grouped by year and month. Ideal for chart rendering. Requires `analyst` or `admin` role.',
          responses: {
            200: {
              description: 'Monthly trends retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Monthly trends retrieved.' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/MonthlyTrendItem' },
                      },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
          },
        },
      },
      '/api/dashboard/recent': {
        get: {
          tags: ['Dashboard'],
          summary: 'Recent transaction activity',
          description: 'Returns the most recent N transactions, sorted by creation time descending, with user info populated. Requires `analyst` or `admin` role.',
          parameters: [
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
              description: 'Number of recent transactions to return',
            },
          ],
          responses: {
            200: {
              description: 'Recent activity retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Recent activity retrieved.' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Transaction' },
                      },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
          },
        },
      },

      // ════════════════════════════════════
      //  USERS
      // ════════════════════════════════════
      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'List all users (admin only)',
          description: 'Returns a paginated list of all users, with optional filters for role and active status. Requires `admin` role.',
          parameters: [
            { $ref: '#/components/parameters/page' },
            { $ref: '#/components/parameters/limit' },
            {
              in: 'query', name: 'role', schema: { $ref: '#/components/schemas/Role' },
              description: 'Filter by user role',
            },
            {
              in: 'query', name: 'isActive', schema: { type: 'boolean' },
              description: 'Filter by active/inactive status',
            },
          ],
          responses: {
            200: {
              description: 'Users listed successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Users retrieved.' },
                      data: {
                        type: 'object',
                        properties: {
                          users: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/User' },
                          },
                          pagination: { $ref: '#/components/schemas/Pagination' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
          },
        },
      },
      '/api/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Get a single user (admin only)',
          description: 'Retrieves full details of a user by MongoDB ObjectId. Requires `admin` role.',
          parameters: [{ $ref: '#/components/parameters/mongoId' }],
          responses: {
            200: {
              description: 'User retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'User retrieved.' },
                      data: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
        patch: {
          tags: ['Users'],
          summary: 'Update a user (admin only)',
          description: "Updates a user's `name`, `role`, or `isActive` status. An admin cannot demote themselves. Requires `admin` role.",
          parameters: [{ $ref: '#/components/parameters/mongoId' }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateUserBody' },
              },
            },
          },
          responses: {
            200: {
              description: 'User updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'User updated.' },
                      data: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
            422: { $ref: '#/components/responses/ValidationError' },
          },
        },
        delete: {
          tags: ['Users'],
          summary: 'Deactivate a user (admin only)',
          description: "Sets a user's `isActive` to `false`. The user remains in the database but can no longer log in. An admin cannot deactivate themselves. Requires `admin` role.",
          parameters: [{ $ref: '#/components/parameters/mongoId' }],
          responses: {
            200: {
              description: 'User deactivated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'User deactivated.' },
                      data: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
      },
    },
  },
  apis: [], // All docs are inline above — no JSDoc scanning needed
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
