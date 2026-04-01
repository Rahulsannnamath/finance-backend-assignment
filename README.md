# 💰 Finance Dashboard Backend API

A robust, production-grade REST API for a **Finance Dashboard System** with user role management, financial records CRUD, dashboard analytics, and role-based access control (RBAC).

> Built as a backend engineering assessment submission demonstrating clean architecture, separation of concerns, and thoughtful system design.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Role-Based Access Control](#-role-based-access-control)
- [Database Schema](#-database-schema)
- [Testing](#-testing)
- [Design Decisions & Assumptions](#-design-decisions--assumptions)
- [Optional Enhancements Implemented](#-optional-enhancements-implemented)

---

## ✨ Features

- **JWT Authentication** — Secure token-based auth with bcrypt password hashing
- **Role-Based Access Control** — Three-tier role system (Viewer, Analyst, Admin)
- **Financial Records CRUD** — Create, read, update, and soft-delete transactions
- **Advanced Filtering** — Filter by type, category, date range, and text search
- **Dashboard Analytics** — Aggregated summaries, category breakdowns, monthly trends
- **Pagination** — All list endpoints support page/limit parameters
- **Input Validation** — Request validation via express-validator with detailed error messages
- **Soft Delete** — Transactions are never physically deleted, preserving data integrity
- **Global Error Handling** — Consistent error responses with Mongoose/JWT error normalization
- **Database Seeding** — One-command seeder with realistic sample data

---

## 🛠 Tech Stack

| Component       | Technology               |
|-----------------|--------------------------|
| Runtime         | Node.js (ES Modules)     |
| Framework       | Express 5                |
| Database        | MongoDB Atlas (Mongoose) |
| Authentication  | JWT (jsonwebtoken)       |
| Password Hash   | bcryptjs                 |
| Validation      | express-validator        |
| Testing         | Vitest + Supertest       |

---

## 🏗 Architecture

```
backend/
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/
│   ├── authController.js        # Auth endpoints (register, login, profile)
│   ├── userController.js        # User management (admin)
│   ├── transactionController.js # Financial records CRUD
│   └── dashboardController.js   # Analytics endpoints
├── middleware/
│   ├── auth.js                  # JWT authentication
│   ├── rbac.js                  # Role-based authorization
│   ├── validate.js              # Request validation
│   └── errorHandler.js          # Global error handler
├── models/
│   ├── User.js                  # User schema
│   └── Transaction.js           # Transaction schema
├── routes/
│   ├── authRoutes.js            # /api/auth/*
│   ├── userRoutes.js            # /api/users/*
│   ├── transactionRoutes.js     # /api/transactions/*
│   └── dashboardRoutes.js       # /api/dashboard/*
├── services/
│   ├── authService.js           # Auth business logic
│   ├── userService.js           # User management logic
│   ├── transactionService.js    # Transaction business logic
│   └── dashboardService.js      # Aggregation pipelines
├── utils/
│   ├── ApiError.js              # Custom error class
│   ├── ApiResponse.js           # Standardized response helper
│   └── constants.js             # Role & category constants
├── tests/
│   ├── auth.test.js             # Auth endpoint tests
│   ├── transaction.test.js      # Transaction endpoint tests
│   └── dashboard.test.js        # Dashboard endpoint tests
├── seed.js                      # Database seeder
├── server.js                    # Application entry point
└── .env.example                 # Environment template
```

The application follows a **layered architecture** pattern:

1. **Routes** → Define endpoints and attach validation + middleware
2. **Controllers** → Handle HTTP request/response cycle
3. **Services** → Contain business logic, data transformations, and DB queries
4. **Models** → Define data schemas and database-level constraints
5. **Middleware** → Cross-cutting concerns (auth, RBAC, validation, errors)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** — Atlas cluster or local instance
- **npm** package manager

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Rahulsannnamath/finance-backend-assignment.git
cd finance-backend-assignment/backend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 4. Seed the database (creates sample users + transactions)
npm run seed

# 5. Start the development server
npm run dev
```

The server will start at `http://localhost:5000`.

### Seeded Accounts

| Role    | Email                | Password     |
|---------|----------------------|--------------|
| Admin   | admin@finance.com    | admin123     |
| Analyst | analyst@finance.com  | analyst123   |
| Viewer  | viewer@finance.com   | viewer123    |

---

## 📡 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Health Check

```
GET /api/health
```

### Authentication

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

### Auth Endpoints

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response** `201 Created`:
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "viewer",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@finance.com",
  "password": "admin123"
}
```

#### Get Profile

```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

### User Management (Admin Only)

#### List Users

```http
GET /api/users?page=1&limit=10&role=viewer&isActive=true
Authorization: Bearer <admin_token>
```

#### Get User

```http
GET /api/users/:id
Authorization: Bearer <admin_token>
```

#### Update User

```http
PATCH /api/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "analyst",
  "isActive": true
}
```

#### Deactivate User

```http
DELETE /api/users/:id
Authorization: Bearer <admin_token>
```

---

### Transaction Endpoints

#### Create Transaction (Admin Only)

```http
POST /api/transactions
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "amount": 5000.00,
  "type": "income",
  "category": "Salary",
  "date": "2025-03-15",
  "description": "March salary payment"
}
```

**Valid Categories:** `Salary`, `Freelance`, `Investment`, `Food`, `Transport`, `Utilities`, `Entertainment`, `Healthcare`, `Education`, `Shopping`, `Rent`, `Insurance`, `Savings`, `Gifts`, `Other`

**Valid Types:** `income`, `expense`

#### List Transactions (All Roles)

```http
GET /api/transactions?page=1&limit=10&type=income&category=Salary&startDate=2025-01-01&endDate=2025-12-31&search=salary&sortBy=date&sortOrder=desc
Authorization: Bearer <any_token>
```

| Parameter   | Type   | Description                          |
|-------------|--------|--------------------------------------|
| page        | number | Page number (default: 1)             |
| limit       | number | Items per page (default: 10, max: 100) |
| type        | string | Filter by `income` or `expense`      |
| category    | string | Filter by category name              |
| startDate   | string | ISO date — records from this date    |
| endDate     | string | ISO date — records until this date   |
| search      | string | Search in description (case-insensitive) |
| sortBy      | string | Sort field: `date`, `amount`, `createdAt` |
| sortOrder   | string | `asc` or `desc`                      |

#### Get Transaction

```http
GET /api/transactions/:id
Authorization: Bearer <any_token>
```

#### Update Transaction (Admin Only)

```http
PATCH /api/transactions/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "amount": 5500.00,
  "description": "Updated salary"
}
```

#### Delete Transaction (Admin Only — Soft Delete)

```http
DELETE /api/transactions/:id
Authorization: Bearer <admin_token>
```

---

### Dashboard Endpoints (Analyst & Admin)

#### Financial Summary

```http
GET /api/dashboard/summary
Authorization: Bearer <analyst_or_admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Dashboard summary retrieved.",
  "data": {
    "totalIncome": 25000.00,
    "totalExpenses": 12500.50,
    "netBalance": 12499.50,
    "totalRecords": 50
  }
}
```

#### Category Breakdown

```http
GET /api/dashboard/category-breakdown
Authorization: Bearer <analyst_or_admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "category": "Salary",
      "breakdown": [
        { "type": "income", "total": 15000.00, "count": 3 }
      ],
      "grandTotal": 15000.00
    }
  ]
}
```

#### Monthly Trends (Last 12 Months)

```http
GET /api/dashboard/trends
Authorization: Bearer <analyst_or_admin_token>
```

#### Recent Activity

```http
GET /api/dashboard/recent?limit=10
Authorization: Bearer <analyst_or_admin_token>
```

---

## 🔐 Role-Based Access Control

| Action                      | Viewer | Analyst | Admin |
|-----------------------------|--------|---------|-------|
| Register / Login            | ✅     | ✅      | ✅    |
| View own profile            | ✅     | ✅      | ✅    |
| View transactions           | ✅     | ✅      | ✅    |
| View dashboard summaries    | ❌     | ✅      | ✅    |
| View dashboard trends       | ❌     | ✅      | ✅    |
| Create transactions         | ❌     | ❌      | ✅    |
| Update transactions         | ❌     | ❌      | ✅    |
| Delete transactions         | ❌     | ❌      | ✅    |
| Manage users                | ❌     | ❌      | ✅    |

### Implementation

Access control is enforced at two levels:

1. **Route-level middleware** — `authorize('admin')` and `authorizeMinRole('analyst')` functions guard routes
2. **Service-level checks** — Business logic prevents self-demotion and self-deactivation

---

## 🗄 Database Schema

### User

| Field      | Type     | Constraints                           |
|------------|----------|---------------------------------------|
| name       | String   | Required, 2–100 chars                 |
| email      | String   | Required, unique, validated format    |
| password   | String   | Required, min 6 chars, bcrypt hashed  |
| role       | String   | Enum: viewer, analyst, admin          |
| isActive   | Boolean  | Default: true                         |
| createdAt  | Date     | Auto-generated                        |
| updatedAt  | Date     | Auto-generated                        |

### Transaction

| Field       | Type     | Constraints                          |
|-------------|----------|--------------------------------------|
| user        | ObjectId | Reference to User, required          |
| amount      | Number   | Required, min 0.01                   |
| type        | String   | Enum: income, expense                |
| category    | String   | Enum: 15 predefined categories       |
| date        | Date     | Required, defaults to now            |
| description | String   | Optional, max 500 chars              |
| isDeleted   | Boolean  | Soft delete flag, hidden by default  |
| createdAt   | Date     | Auto-generated                       |
| updatedAt   | Date     | Auto-generated                       |

---

## 🧪 Testing

Tests are written with **Vitest** and **Supertest**.

```bash
# Seed the database first (tests depend on seeded data)
npm run seed

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

- **Auth Tests** — Registration, login, profile retrieval, validation errors, duplicate emails
- **Transaction Tests** — CRUD operations, RBAC enforcement, input validation, filtering, pagination
- **Dashboard Tests** — Summary, category breakdown, trends, recent activity, role restrictions

---

## 🧠 Design Decisions & Assumptions

### Architecture Choices

1. **Layered Architecture** — Routes → Controllers → Services → Models. This separation ensures each layer has a single responsibility, making the codebase testable and maintainable.

2. **ES Modules** — Used native ES module syntax (`import/export`) instead of CommonJS for modern JavaScript compatibility.

3. **Service Layer** — Business logic is extracted into service classes rather than being embedded in controllers. This makes logic reusable and independently testable.

4. **Static Class Methods** — Services use static methods since they don't maintain state; this avoids unnecessary instantiation while keeping related logic grouped.

### Security Decisions

5. **Password never exposed** — The User model uses `select: false` on the password field, ensuring it's never accidentally leaked in API responses.

6. **bcrypt with 12 salt rounds** — Provides strong hashing while maintaining reasonable performance.

7. **Self-protection guards** — Admins cannot demote or deactivate themselves, preventing accidental lockout.

### Data Design

8. **Soft Delete** — Transactions use an `isDeleted` flag rather than physical deletion. A Mongoose query middleware automatically filters deleted records, so the rest of the application doesn't need to worry about it.

9. **Predefined Categories** — Rather than freeform categories, the system uses an enum of 15 common finance categories. This ensures data consistency and enables reliable aggregation.

10. **Compound Indexes** — Strategic indexes on `(user, isDeleted, date)`, `(type, date)`, and `(category, date)` optimize the most common query patterns.

### Assumptions

- New users register with the `viewer` role by default; an admin must promote them.
- The `date` field on transactions represents when the actual financial event occurred (not when the record was created).
- All monetary amounts are stored as floating-point numbers (sufficient for a dashboard/assessment context; a production system might use fixed-point or integer cents).
- The seeder creates 50 randomized transactions spanning 6 months for realistic dashboard data.

---

## 🌟 Optional Enhancements Implemented

| Enhancement              | Status |
|--------------------------|--------|
| JWT Authentication       | ✅     |
| Pagination               | ✅     |
| Text Search              | ✅     |
| Soft Delete              | ✅     |
| Unit/Integration Tests   | ✅     |
| API Documentation        | ✅     |
| Database Seeder          | ✅     |
| Input Validation         | ✅     |
| Error Normalization      | ✅     |
| Role Hierarchy           | ✅     |

---

## 📜 Error Response Format

All errors follow a consistent structure:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email address",
      "value": "not-an-email"
    }
  ]
}
```

Common HTTP status codes used:

| Code | Meaning                |
|------|------------------------|
| 200  | Success                |
| 201  | Created                |
| 400  | Bad Request / Validation Error |
| 401  | Unauthorized           |
| 403  | Forbidden              |
| 404  | Not Found              |
| 409  | Conflict (duplicate)   |
| 500  | Internal Server Error  |

---

## 📄 License

ISC

---

*Built with care and attention to backend engineering principles.*
