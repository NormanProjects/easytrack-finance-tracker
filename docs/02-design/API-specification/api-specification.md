# EasyTrack API Specification

## Document Control
- **API Version**: v1
- **Base URL**: `http://localhost:8080/api/v1` (Development)
- **Production URL**: `https://api.easytrack.com/api/v1`
- **Status**: Design Phase

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Common Patterns](#common-patterns)
3. [Error Handling](#error-handling)
4. [Authentication Endpoints](#authentication-endpoints)
5. [User Endpoints](#user-endpoints)
6. [Transaction Endpoints](#transaction-endpoints)
7. [Category Endpoints](#category-endpoints)
8. [Budget Endpoints](#budget-endpoints)
9. [Dashboard Endpoints](#dashboard-endpoints)
10. [Savings Goal Endpoints](#savings-goal-endpoints)
11. [Debt Endpoints](#debt-endpoints)

## Authentication & Authorization

### Authentication Method
**Type**: JWT (JSON Web Token)  
**Algorithm**: HS512  
**Header Format**:
```http
Authorization: Bearer
### Token Structure
```json
{
  "sub": "user@example.com",
  "userId": 123,
  "iat": 1704067200,
  "exp": 1704153600,
  "type": "ACCESS"
}
```

### Protected Endpoints
All endpoints except `/api/v1/auth/*` require a valid JWT token.

**Missing Token Response**:
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource",
  "path": "/api/v1/transactions"
}
```

**Invalid/Expired Token Response**:
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token is expired or invalid",
  "path": "/api/v1/transactions"
}
```

---

## Common Patterns

### Pagination
All list endpoints support pagination via query parameters:

**Parameters**:
- `page` (integer, default: 0) - Zero-based page number
- `size` (integer, default: 20) - Items per page (max: 100)
- `sort` (string, optional) - Sort field and direction (e.g., `transactionDate,desc`)

**Example Request**:
```http
GET /api/v1/transactions?page=0&size=20&sort=transactionDate,desc
```

**Response Format**:
```json
{
  "content": [  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalPages": 5,
  "totalElements": 100,
  "last": false,
  "first": true,
  "size": 20,
  "number": 0,
  "numberOfElements": 20,
  "empty": false
}
```

### Date Format
All dates use **ISO 8601** format:
- Date: `YYYY-MM-DD` (e.g., `2025-01-20`)
- DateTime: `YYYY-MM-DDTHH:mm:ssZ` (e.g., `2025-01-20T10:30:00Z`)

### Currency Format
All monetary amounts are represented as **decimal strings** with 2 decimal places:
```json
{
  "amount": "123.45"
}
```

### HTTP Status Codes
| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE with no response body |
| 400 | Bad Request | Validation error, malformed request |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 422 | Unprocessable Entity | Valid request but business logic prevents action |
| 500 | Internal Server Error | Unexpected server error |

---

## Error Handling

### Standard Error Response
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/transactions",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be greater than 0"
    },
    {
      "field": "transactionDate",
      "message": "Transaction date cannot be in the future"
    }
  ]
}
```

### Validation Error Example
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid input data",
  "path": "/api/v1/auth/register",
  "errors": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

## Authentication Endpoints

### 1. Register User

**Endpoint**: `POST /api/v1/auth/register`

**Description**: Create a new user account

**Authentication**: None required

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Request Validation**:
- `email` (required, valid email format, max 255 chars)
- `password` (required, min 8 chars, at least 1 uppercase, 1 lowercase, 1 number)
- `firstName` (optional, max 100 chars)
- `lastName` (optional, max 100 chars)

**Success Response** (201 Created):
```json
{
  "message": "Registration successful",
  "user": {
    "id": 123,
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2025-01-20T10:30:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsInVzZXJJZCI6MTIzLCJpYXQiOjE3MDQwNjcyMDAsImV4cCI6MTcwNDE1MzYwMCwidHlwZSI6IkFDQ0VTUyJ9.signature",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsInVzZXJJZCI6MTIzLCJpYXQiOjE3MDQwNjcyMDAsImV4cCI6MTcwNjc0NTYwMCwidHlwZSI6IlJFRlJFU0gifQ.signature",
  "expiresIn": 86400
}
```

**Error Responses**:

**409 Conflict** (Email already exists):
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Email already registered",
  "path": "/api/v1/auth/register"
}
```

**400 Bad Request** (Validation error):
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/auth/register",
  "errors": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    },
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }
  ]
}
```

---

### 2. Login User

**Endpoint**: `POST /api/v1/auth/login`

**Description**: Authenticate user and receive JWT tokens

**Authentication**: None required

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Success Response** (200 OK):
```json
{
  "message": "Login successful",
  "user": {
    "id": 123,
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profilePictureUrl": null,
    "lastLoginAt": "2025-01-20T10:30:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "expiresIn": 86400
}
```

**Error Responses**:

**401 Unauthorized** (Invalid credentials):
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid email or password",
  "path": "/api/v1/auth/login"
}
```

**403 Forbidden** (Account disabled):
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Account has been disabled. Please contact support.",
  "path": "/api/v1/auth/login"
}
```

---

### 3. Refresh Access Token

**Endpoint**: `POST /api/v1/auth/refresh-token`

**Description**: Get a new access token using refresh token

**Authentication**: None required (uses refresh token in body)

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
}
```

**Success Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "expiresIn": 86400
}
```

**Error Response** (401 Unauthorized):
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired refresh token",
  "path": "/api/v1/auth/refresh-token"
}
```

---

### 4. Forgot Password

**Endpoint**: `POST /api/v1/auth/forgot-password`

**Description**: Request password reset email

**Authentication**: None required

**Request Body**:
```json
{
  "email": "john.doe@example.com"
}
```

**Success Response** (200 OK):
```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

**Note**: Always returns success to prevent email enumeration attacks.

---

### 5. Reset Password

**Endpoint**: `POST /api/v1/auth/reset-password`

**Description**: Reset password using token from email

**Authentication**: None required (uses reset token)

**Request Body**:
```json
{
  "token": "abc123-def456-ghi789",
  "newPassword": "NewSecurePass123!"
}
```

**Success Response** (200 OK):
```json
{
  "message": "Password reset successful. You can now log in with your new password."
}
```

**Error Responses**:

**400 Bad Request** (Invalid/expired token):
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid or expired reset token",
  "path": "/api/v1/auth/reset-password"
}
```

**400 Bad Request** (Token already used):
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "This reset token has already been used",
  "path": "/api/v1/auth/reset-password"
}
```

---

### 6. Google OAuth Login

**Endpoint**: `POST /api/v1/auth/google`

**Description**: Authenticate with Google OAuth

**Authentication**: None required

**Request Body**:
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFhYzJkZjgw..."
}
```

**Success Response** (200 OK):
```json
{
  "message": "Google sign-in successful",
  "user": {
    "id": 124,
    "email": "john.doe@gmail.com",
    "firstName": "John",
    "lastName": "Doe",
    "profilePictureUrl": "https://lh3.googleusercontent.com/...",
    "oauthProvider": "GOOGLE"
  },
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "expiresIn": 86400,
  "isNewUser": false
}
```

**Error Response** (401 Unauthorized):
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid Google ID token",
  "path": "/api/v1/auth/google"
}
```

---

## User Endpoints

### 7. Get Current User Profile

**Endpoint**: `GET /api/v1/users/me`

**Description**: Get authenticated user's profile

**Authentication**: Required (JWT)

**Success Response** (200 OK):
```json
{
  "id": 123,
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profilePictureUrl": null,
  "isEmailVerified": false,
  "createdAt": "2025-01-15T08:00:00Z",
  "lastLoginAt": "2025-01-20T10:30:00Z"
}
```

---

### 8. Update User Profile

**Endpoint**: `PUT /api/v1/users/me`

**Description**: Update authenticated user's profile

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "firstName": "Jonathan",
  "lastName": "Doe"
}
```

**Success Response** (200 OK):
```json
{
  "id": 123,
  "email": "john.doe@example.com",
  "firstName": "Jonathan",
  "lastName": "Doe",
  "profilePictureUrl": null,
  "updatedAt": "2025-01-20T10:35:00Z"
}
```

---

## Transaction Endpoints

### 9. Get All Transactions

**Endpoint**: `GET /api/v1/transactions`

**Description**: Get paginated list of user's transactions

**Authentication**: Required (JWT)

**Query Parameters**:
- `page` (integer, default: 0)
- `size` (integer, default: 20, max: 100)
- `sort` (string, default: `transactionDate,desc`)
- `categoryId` (integer, optional) - Filter by category
- `startDate` (date, optional) - Filter from date (ISO 8601)
- `endDate` (date, optional) - Filter to date (ISO 8601)

**Example Request**:
```http
GET /api/v1/transactions?page=0&size=20&categoryId=3&startDate=2025-01-01&endDate=2025-01-31
```

**Success Response** (200 OK):
```json
{
  "content": [
    {
      "id": 1,
      "amount": "45.67",
      "merchantName": "Whole Foods",
      "description": "Weekly groceries",
      "transactionDate": "2025-01-20",
      "category": {
        "id": 3,
        "name": "Groceries",
        "icon": "shopping-cart",
        "type": "EXPENSE"
      },
      "createdAt": "2025-01-20T10:00:00Z",
      "updatedAt": "2025-01-20T10:00:00Z"
    },
    {
      "id": 2,
      "amount": "23.50",
      "merchantName": "Starbucks",
      "description": null,
      "transactionDate": "2025-01-19",
      "category": {
        "id": 4,
        "name": "Dining",
        "icon": "utensils",
        "type": "EXPENSE"
      },
      "createdAt": "2025-01-19T15:30:00Z",
      "updatedAt": "2025-01-19T15:30:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    }
  },
  "totalPages": 3,
  "totalElements": 50,
  "last": false,
  "first": true,
  "size": 20,
  "number": 0,
  "numberOfElements": 20,
  "empty": false
}
```

---

### 10. Get Single Transaction

**Endpoint**: `GET /api/v1/transactions/{id}`

**Description**: Get a specific transaction by ID

**Authentication**: Required (JWT)

**Path Parameters**:
- `id` (integer, required) - Transaction ID

**Success Response** (200 OK):
```json
{
  "id": 1,
  "amount": "45.67",
  "merchantName": "Whole Foods",
  "description": "Weekly groceries",
  "transactionDate": "2025-01-20",
  "category": {
    "id": 3,
    "name": "Groceries",
    "icon": "shopping-cart",
    "type": "EXPENSE"
  },
  "createdAt": "2025-01-20T10:00:00Z",
  "updatedAt": "2025-01-20T10:00:00Z"
}
```

**Error Response** (404 Not Found):
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Transaction not found or does not belong to user",
  "path": "/api/v1/transactions/999"
}
```

---

### 11. Create Transaction

**Endpoint**: `POST /api/v1/transactions`

**Description**: Create a new transaction

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "amount": "45.67",
  "categoryId": 3,
  "merchantName": "Whole Foods",
  "description": "Weekly groceries",
  "transactionDate": "2025-01-20"
}
```

**Request Validation**:
- `amount` (required, must be > 0, max 2 decimal places)
- `categoryId` (required, must exist and belong to user or be default)
- `merchantName` (optional, max 255 chars)
- `description` (optional, max 1000 chars)
- `transactionDate` (required, cannot be future date)

**Success Response** (201 Created):
```json
{
  "id": 101,
  "amount": "45.67",
  "merchantName": "Whole Foods",
  "description": "Weekly groceries",
  "transactionDate": "2025-01-20",
  "category": {
    "id": 3,
    "name": "Groceries",
    "icon": "shopping-cart",
    "type": "EXPENSE"
  },
  "createdAt": "2025-01-20T10:35:00Z",
  "updatedAt": "2025-01-20T10:35:00Z"
}
```

**Error Response** (400 Bad Request):
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/transactions",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be greater than 0"
    },
    {
      "field": "transactionDate",
      "message": "Transaction date cannot be in the future"
    }
  ]
}
```

---

### 12. Update Transaction

**Endpoint**: `PUT /api/v1/transactions/{id}`

**Description**: Update an existing transaction

**Authentication**: Required (JWT)

**Path Parameters**:
- `id` (integer, required) - Transaction ID

**Request Body**:
```json
{
  "amount": "50.00",
  "categoryId": 3,
  "merchantName": "Whole Foods Market",
  "description": "Monthly groceries",
  "transactionDate": "2025-01-20"
}
```

**Success Response** (200 OK):
```json
{
  "id": 1,
  "amount": "50.00",
  "merchantName": "Whole Foods Market",
  "description": "Monthly groceries",
  "transactionDate": "2025-01-20",
  "category": {
    "id": 3,
    "name": "Groceries",
    "icon": "shopping-cart",
    "type": "EXPENSE"
  },
  "createdAt": "2025-01-20T10:00:00Z",
  "updatedAt": "2025-01-20T11:00:00Z"
}
```

**Error Response** (404 Not Found):
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Transaction not found or does not belong to user",
  "path": "/api/v1/transactions/999"
}
```

---

### 13. Delete Transaction

**Endpoint**: `DELETE /api/v1/transactions/{id}`

**Description**: Delete a transaction

**Authentication**: Required (JWT)

**Path Parameters**:
- `id` (integer, required) - Transaction ID

**Success Response** (204 No Content):
```
(Empty body)
```

**Error Response** (404 Not Found):
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Transaction not found or does not belong to user",
  "path": "/api/v1/transactions/999"
}
```

---

### 14. Import Transactions from CSV

**Endpoint**: `POST /api/v1/transactions/import-csv`

**Description**: Bulk import transactions from CSV file

**Authentication**: Required (JWT)

**Request**:
- Content-Type: `multipart/form-data`
- Body: File upload

**Request Body** (multipart/form-data):
```
file: [CSV file]
```

**CSV Format**:
```csv
Date,Description,Amount
2025-01-20,Whole Foods,45.67
2025-01-19,Starbucks,23.50
2025-01-18,Uber,12.00
```

**Required CSV Columns**:
- `Date` (YYYY-MM-DD or MM/DD/YYYY)
- `Description` or `Merchant` (merchant name)
- `Amount` (positive number)

**Success Response** (200 OK):
```json
{
  "message": "CSV import completed successfully",
  "summary": {
    "totalRows": 150,
    "imported": 145,
    "duplicates": 5,
    "errors": 0
  },
  "processingTime": "2.3 seconds"
}
```

**Partial Success Response** (200 OK):
```json
{
  "message": "CSV import completed with errors",
  "summary": {
    "totalRows": 150,
    "imported": 140,
    "duplicates": 5,
    "errors": 5
  },
  "errorDetails": [
    {
      "row": 25,
      "error": "Invalid date format: '2025/01/20'"
    },
    {
      "row": 48,
      "error": "Amount must be a valid number: 'abc'"
    }
  ],
  "processingTime": "2.5 seconds"
}
```

**Error Response** (400 Bad Request):
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid CSV file format. Required columns: Date, Description, Amount",
  "path": "/api/v1/transactions/import-csv"
}
```

---

## Category Endpoints

### 15. Get All Categories

**Endpoint**: `GET /api/v1/categories`

**Description**: Get all categories (default + user's custom)

**Authentication**: Required (JWT)

**Query Parameters**:
- `type` (string, optional) - Filter by INCOME or EXPENSE

**Success Response** (200 OK):
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Salary",
      "icon": "dollar-sign",
      "type": "INCOME",
      "isDefault": true
    },
    {
      "id": 3,
      "name": "Groceries",
      "icon": "shopping-cart",
      "type": "EXPENSE",
      "isDefault": true
    },
    {
      "id": 15,
      "name": "Coffee Shops",
      "icon": "coffee",
      "type": "EXPENSE",
      "isDefault": false
    }
  ]
}
```

---

### 16. Create Custom Category

**Endpoint**: `POST /api/v1/categories`

**Description**: Create a custom category

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "name": "Coffee Shops",
  "icon": "coffee",
  "type": "EXPENSE"
}
```

**Request Validation**:
- `name` (required, max 100 chars, must be unique for user)
- `icon` (optional, max 50 chars)
- `type` (required, must be INCOME or EXPENSE)

**Success Response** (201 Created):
```json
{
  "id": 15,
  "name": "Coffee Shops",
  "icon": "coffee",
  "type": "EXPENSE",
  "isDefault": false,
  "createdAt": "2025-01-20T10:35:00Z"
}
```

**Error Response** (409 Conflict):
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Category with this name already exists",
  "path": "/api/v1/categories"
}
```

---

### 17. Update Category

**Endpoint**: `PUT /api/v1/categories/{id}`

**Description**: Update a custom category (cannot update default categories)

**Authentication**: Required (JWT)

**Path Parameters**:
- `id` (integer, required) - Category ID

**Request Body**:
```json
{
  "name": "Cafe & Coffee",
  "icon": "coffee"
}
```

**Success Response** (200 OK):
```json
{
  "id": 15,
  "name": "Cafe & Coffee",
  "icon": "coffee",
  "type": "EXPENSE",
  "isDefault": false,
  "updatedAt": "2025-01-20T11:00:00Z"
}
```

**Error Response** (403 Forbidden):
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Cannot modify default categories",
  "path": "/api/v1/categories/3"
}
```

---

### 18. Delete Category

**Endpoint**: `DELETE /api/v1/categories/{id}`

**Description**: Delete a custom category (cannot delete default or categories with transactions)

**Authentication**: Required (JWT)

**Path Parameters**:
- `id` (integer, required) - Category ID

**Success Response** (204 No Content):
```
(Empty body)
```

**Error Response** (422 Unprocessable Entity):
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 422,
  "error": "Unprocessable Entity",
  "message": "Cannot delete category with existing transactions. Please recategorize transactions first.",
  "path": "/api/v1/categories/15"
}
```

---

## Budget Endpoints

### 19. Get Current Budget

**Endpoint**: `GET /api/v1/budgets/current`

**Description**: Get active budget for current month

**Authentication**: Required (JWT)

**Success Response** (200 OK):
```json
{
  "id": 1,
  "amount": "2000.00",
  "period": "MONTHLY",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "category": null,
  "currentSpending": "1234.56",
  "remainingBudget": "765.44",
  "percentageUsed": 61.73,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

**Error Response** (404 Not Found):
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "No active budget found for current period",
  "path": "/api/v1/budgets/current"
}
```

---

### 20. Create Budget

**Endpoint**: `POST /api/v1/budgets`

**Description**: Create a new budget

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "amount": "2000.00",
  "period": "MONTHLY",
  "startDate": "2025-02-01",
  "categoryId": null
}
```

**Request Validation**:
- `amount` (required, must be > 0)
- `period` (required, must be MONTHLY or YEARLY)
- `startDate` (required, ISO 8601 date)
- `categoryId` (optional, null = overall budget)
```
** Success Response (201 Created)**:
{
  "id": 2,
  "amount": "2000.00",
  "period": "MONTHLY",
  "startDate": "2025-02-01",
  "endDate": "2025-02-28",
  "category": null,
  "createdAt": "2025-01-20T10:35:00Z"
  }
```
**Error Response (409 Conflict)**:
{
  "timestamp": "2025-01-20T10:30:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "A budget already exists for this period and category",
  "path": "/api/v1/budgets"
}
```
**Update Budget**:
Endpoint: PUT /api/v1/budgets/{id}
Request Body:
{
  "amount": "2500.00"
}
```
**Success Response (200 OK)**:
{
  "id": 1,
  "amount": "2500.00",
  "period": "MONTHLY",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "category": null,
  "updatedAt": "2025-01-20T11:00:00Z"
}
```

---

### 22. Delete Budget

**Endpoint**: `DELETE /api/v1/budgets/{id}`

**Description**: Delete a budget

**Authentication**: Required (JWT)

**Path Parameters**:
- `id` (integer, required) - Budget ID

**Success Response** (204 No Content):
```
(Empty body)

Dashboard Endpoints
Get Dashboard Summary
    Endpoint: GET /api/v1/dashboard/summary
    Description: Get aggregated financial dashboard data
    Authentication: Required (JWT)

    Success Response (200 OK):

    json{
    "currentMonthSpending": "1234.56",
    "previousMonthSpending": "1100.00",
    "monthlyBudget": "2000.00",
    "leftToSpend": "765.44",
    "safeToSpendDaily": "69.59",
    "daysRemainingInMonth": 11,
    "spendingTrendPercentage": 12.23,
    "currentMonth": "January",
    "currentYear": 2025,
    "topCategories": [
    {
    "category": {
    "id": 3,
    "name": "Groceries",
    "icon": "shopping-cart"
    },
    "totalSpent": "456.78",
    "transactionCount": 12
    },
    {
    "category": {
    "id": 4,
    "name": "Dining",
    "icon": "utensils"
    },
    "totalSpent": "234.56",
    "transactionCount": 15
    },
    {
    "category": {
    "id": 5,
    "name": "Transport",
    "icon": "car"
    },
    "totalSpent": "123.45",
    "transactionCount": 8
    }
    ],
    "savingsGoal": {
    "id": 1,
    "name": "Vacation Fund",
    "targetAmount": "5000.00",
    "currentAmount": "2350.00",
    "progressPercentage": 47.0,
    "estimatedCompletionDate": "2025-07-15"
    },
    "primaryDebt": {
    "id": 1,
    "name": "Student Loan",
    "currentBalance": "15000.00",
    "minimumPayment": "300.00",
    "estimatedPayoffDate": "2029-12-31"
    }
    }
Get Spending Trends
Endpoint: GET /api/v1/dashboard/trends
Description: Get monthly spending trends (last 6 months)
Authentication: Required (JWT)
Query Parameters:

months (integer, default: 6, max: 12) - Number of months to retrieve

Success Response (200 OK):
json{
"trends": [
{
"month": "August 2024",
"year": 2024,
"totalIncome": "3500.00",
"totalExpenses": "2100.00",
"netIncome": "1400.00"
},
{
"month": "September 2024",
"year": 2024,
"totalIncome": "3500.00",
"totalExpenses": "2250.00",
"netIncome": "1250.00"
},
{
"month": "October 2024",
"year": 2024,
"totalIncome": "3500.00",
"totalExpenses": "1980.00",
"netIncome": "1520.00"
},
{
"month": "November 2024",
"year": 2024,
"totalIncome": "3500.00",
"totalExpenses": "2400.00",
"netIncome": "1100.00"
},
{
"month": "December 2024",
"year": 2024,
"totalIncome": "4200.00",
"totalExpenses": "2800.00",
"netIncome": "1400.00"
},
{
"month": "January 2025",
"year": 2025,
"totalIncome": "3500.00",
"totalExpenses": "1234.56",
"netIncome": "2265.44"
}
],
"averageMonthlyIncome": "3616.67",
"averageMonthlyExpenses": "2127.43",
"averageNetIncome": "1489.24"
}

Savings Goal Endpoints
25. Get All Savings Goals
    Endpoint: GET /api/v1/savings-goals
    Description: Get all user's savings goals
    Authentication: Required (JWT)
    Success Response (200 OK):
    json{
    "goals": [
    {
    "id": 1,
    "name": "Vacation Fund",
    "targetAmount": "5000.00",
    "currentAmount": "2350.00",
    "monthlyContribution": "500.00",
    "targetDate": "2025-08-01",
    "progressPercentage": 47.0,
    "estimatedCompletionDate": "2025-07-01",
    "createdAt": "2024-12-01T00:00:00Z",
    "updatedAt": "2025-01-20T10:00:00Z"
    },
    {
    "id": 2,
    "name": "Emergency Fund",
    "targetAmount": "10000.00",
    "currentAmount": "3500.00",
    "monthlyContribution": "300.00",
    "targetDate": null,
    "progressPercentage": 35.0,
    "estimatedCompletionDate": "2027-03-01",
    "createdAt": "2024-10-01T00:00:00Z",
    "updatedAt": "2025-01-15T14:00:00Z"
    }
    ]
    }

26. Create Savings Goal
    Endpoint: POST /api/v1/savings-goals
    Description: Create a new savings goal
    Authentication: Required (JWT)
    Request Body:
    json{
    "name": "New Car Down Payment",
    "targetAmount": "8000.00",
    "currentAmount": "0.00",
    "monthlyContribution": "400.00",
    "targetDate": "2026-01-01"
    }
    Request Validation:

name (required, max 255 chars)
targetAmount (required, must be > 0)
currentAmount (optional, default: 0, must be >= 0)
monthlyContribution (optional, must be > 0)
targetDate (optional, ISO 8601 date)

Success Response (201 Created):
json{
"id": 3,
"name": "New Car Down Payment",
"targetAmount": "8000.00",
"currentAmount": "0.00",
"monthlyContribution": "400.00",
"targetDate": "2026-01-01",
"progressPercentage": 0.0,
"estimatedCompletionDate": "2026-08-01",
"createdAt": "2025-01-20T10:35:00Z"
}

27. Update Savings Goal
    Endpoint: PUT /api/v1/savings-goals/{id}
    Description: Update a savings goal (typically to update currentAmount)
    Authentication: Required (JWT)
    Path Parameters:

id (integer, required) - Savings goal ID

Request Body:
json{
"currentAmount": "2850.00",
"monthlyContribution": "600.00"
}
Success Response (200 OK):
json{
"id": 1,
"name": "Vacation Fund",
"targetAmount": "5000.00",
"currentAmount": "2850.00",
"monthlyContribution": "600.00",
"targetDate": "2025-08-01",
"progressPercentage": 57.0,
"estimatedCompletionDate": "2025-06-01",
"updatedAt": "2025-01-20T11:00:00Z"
}
```

---

### 28. Delete Savings Goal

**Endpoint**: `DELETE /api/v1/savings-goals/{id}`

**Description**: Delete a savings goal

**Authentication**: Required (JWT)

**Path Parameters**:
- `id` (integer, required) - Savings goal ID

**Success Response** (204 No Content):
```
(Empty body)

Debt Endpoints
29. Get All Debts
    Endpoint: GET /api/v1/debts
    Description: Get all user's debt accounts
    Authentication: Required (JWT)
    Success Response (200 OK):
    json{
    "debts": [
    {
    "id": 1,
    "name": "Student Loan",
    "originalAmount": "25000.00",
    "currentBalance": "15000.00",
    "interestRate": 4.5,
    "minimumPayment": "300.00",
    "dueDate": "2025-01-28",
    "estimatedPayoffDate": "2029-12-31",
    "totalPaid": "10000.00",
    "progressPercentage": 40.0,
    "createdAt": "2020-09-01T00:00:00Z",
    "updatedAt": "2025-01-20T10:00:00Z"
    },
    {
    "id": 2,
    "name": "Credit Card",
    "originalAmount": "5000.00",
    "currentBalance": "1200.00",
    "interestRate": 18.99,
    "minimumPayment": "50.00",
    "dueDate": "2025-02-05",
    "estimatedPayoffDate": "2027-04-15",
    "totalPaid": "3800.00",
    "progressPercentage": 76.0,
    "createdAt": "2023-03-15T00:00:00Z",
    "updatedAt": "2025-01-18T15:00:00Z"
    }
    ],
    "totalDebt": "16200.00",
    "totalMonthlyPayment": "350.00"
    }

30. Create Debt Account
    Endpoint: POST /api/v1/debts
    Description: Create a new debt account
    Authentication: Required (JWT)
    Request Body:
    json{
    "name": "Car Loan",
    "originalAmount": "20000.00",
    "currentBalance": "18500.00",
    "interestRate": 3.9,
    "minimumPayment": "450.00",
    "dueDate": "2025-02-15"
    }
    Request Validation:

name (required, max 255 chars)
originalAmount (required, must be > 0)
currentBalance (required, must be >= 0)
interestRate (optional, percentage, 0-100)
minimumPayment (optional, must be > 0)
dueDate (optional, ISO 8601 date)

Success Response (201 Created):
json{
"id": 3,
"name": "Car Loan",
"originalAmount": "20000.00",
"currentBalance": "18500.00",
"interestRate": 3.9,
"minimumPayment": "450.00",
"dueDate": "2025-02-15",
"estimatedPayoffDate": "2029-03-15",
"totalPaid": "1500.00",
"progressPercentage": 7.5,
"createdAt": "2025-01-20T10:35:00Z"
}

31. Update Debt Account
    Endpoint: PUT /api/v1/debts/{id}
    Description: Update a debt account (typically to update currentBalance after payment)
    Authentication: Required (JWT)
    Path Parameters:

id (integer, required) - Debt ID

Request Body:
json{
"currentBalance": "14700.00"
}
Success Response (200 OK):
json{
"id": 1,
"name": "Student Loan",
"originalAmount": "25000.00",
"currentBalance": "14700.00",
"interestRate": 4.5,
"minimumPayment": "300.00",
"dueDate": "2025-01-28",
"estimatedPayoffDate": "2029-11-30",
"totalPaid": "10300.00",
"progressPercentage": 41.2,
"updatedAt": "2025-01-20T11:00:00Z"
}
```

---

### 32. Delete Debt Account

**Endpoint**: `DELETE /api/v1/debts/{id}`

**Description**: Delete a debt account

**Authentication**: Required (JWT)

**Path Parameters**:
- `id` (integer, required) - Debt ID

**Success Response** (204 No Content):
```
(Empty body)
---

## CORS Configuration

### Allowed Origins
- Development: `http://localhost:4200`
- Production: `https://easytrack.com`

### Allowed Methods
- GET, POST, PUT, DELETE, OPTIONS

### Allowed Headers
- Authorization, Content-Type, Accept

### Exposed Headers
- X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

### Max Age
- 3600 seconds (1 hour)

---

## Testing the API

### Using Postman

1. **Import Collection**: [Download Postman Collection](../assets/EasyTrack-API.postman_collection.json)

2. **Set Environment Variables**:
    - `baseUrl`: `http://localhost:8080/api/v1`
    - `accessToken`: (will be set automatically after login)

3. **Authentication Flow**:
```
   1. POST {{baseUrl}}/auth/register
   2. POST {{baseUrl}}/auth/login
      → Save accessToken from response
   3. All other requests use: 
      Authorization: Bearer {{accessToken}}
Using cURL
Register:
bashcurl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'
Login:
bashcurl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
Get Transactions (with token):
bashcurl -X GET http://localhost:8080/api/v1/transactions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
## Statistics & Reports Endpoints

### 33. Get Spending by Category

**Endpoint**: `GET /api/v1/statistics/spending-by-category`

**Description**: Get spending breakdown by category for a date range

**Authentication**: Required (JWT)

**Query Parameters**:
- `startDate` (date, required) - Start date (ISO 8601)
- `endDate` (date, required) - End date (ISO 8601)

**Example Request**:
```http
GET /api/v1/statistics/spending-by-category?startDate=2025-01-01&endDate=2025-01-31
```

**Success Response** (200 OK):
```json
{
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  },
  "totalSpending": "1234.56",
  "categoryBreakdown": [
    {
      "category": {
        "id": 3,
        "name": "Groceries",
        "icon": "shopping-cart",
        "type": "EXPENSE"
      },
      "amount": "456.78",
      "percentage": 37.0,
      "transactionCount": 12,
      "averageTransactionAmount": "38.07"
    },
    {
      "category": {
        "id": 4,
        "name": "Dining",
        "icon": "utensils",
        "type": "EXPENSE"
      },
      "amount": "234.56",
      "percentage": 19.0,
      "transactionCount": 15,
      "averageTransactionAmount": "15.64"
    },
    {
      "category": {
        "id": 5,
        "name": "Transport",
        "icon": "car",
        "type": "EXPENSE"
      },
      "amount": "123.45",
      "percentage": 10.0,
      "transactionCount": 8,
      "averageTransactionAmount": "15.43"
    }
  ]
}
```

---

### 34. Get Monthly Comparison

**Endpoint**: `GET /api/v1/statistics/monthly-comparison`

**Description**: Compare income and expenses across multiple months

**Authentication**: Required (JWT)

**Query Parameters**:
- `months` (integer, default: 6, max: 12) - Number of months to compare

**Success Response** (200 OK):
```json
{
  "months": [
    {
      "month": "August 2024",
      "year": 2024,
      "income": "3500.00",
      "expenses": "2100.00",
      "savings": "1400.00",
      "savingsRate": 40.0
    },
    {
      "month": "September 2024",
      "year": 2024,
      "income": "3500.00",
      "expenses": "2250.00",
      "savings": "1250.00",
      "savingsRate": 35.7
    },
    {
      "month": "October 2024",
      "year": 2024,
      "income": "3500.00",
      "expenses": "1980.00",
      "savings": "1520.00",
      "savingsRate": 43.4
    }
  ],
  "averages": {
    "income": "3500.00",
    "expenses": "2110.00",
    "savings": "1390.00",
    "savingsRate": 39.7
  }
}
```

---

### 35. Get Income vs Expenses Chart Data

**Endpoint**: `GET /api/v1/statistics/income-vs-expenses`

**Description**: Get data for income vs expenses chart visualization

**Authentication**: Required (JWT)

**Query Parameters**:
- `year` (integer, optional) - Year to filter (default: current year)

**Success Response** (200 OK):
```json
{
  "year": 2025,
  "monthlyData": [
    {
      "month": "January",
      "monthNumber": 1,
      "income": "3500.00",
      "expenses": "1234.56",
      "netIncome": "2265.44"
    },
    {
      "month": "February",
      "monthNumber": 2,
      "income": "3500.00",
      "expenses": "2100.00",
      "netIncome": "1400.00"
    }
  ],
  "yearToDateTotals": {
    "income": "7000.00",
    "expenses": "3334.56",
    "netIncome": "3665.44"
  }
}
```

---

## Search & Filter Endpoints

### 36. Search Transactions

**Endpoint**: `GET /api/v1/transactions/search`

**Description**: Search transactions by merchant name or description

**Authentication**: Required (JWT)

**Query Parameters**:
- `query` (string, required, min 3 chars) - Search term
- `page` (integer, default: 0)
- `size` (integer, default: 20)

**Example Request**:
```http
GET /api/v1/transactions/search?query=starbucks&page=0&size=20
```

**Success Response** (200 OK):
```json
{
  "content": [
    {
      "id": 45,
      "amount": "5.50",
      "merchantName": "Starbucks",
      "description": "Morning coffee",
      "transactionDate": "2025-01-20",
      "category": {
        "id": 4,
        "name": "Dining",
        "icon": "utensils",
        "type": "EXPENSE"
      }
    },
    {
      "id": 38,
      "amount": "6.75",
      "merchantName": "Starbucks",
      "description": null,
      "transactionDate": "2025-01-18",
      "category": {
        "id": 4,
        "name": "Dining",
        "icon": "utensils",
        "type": "EXPENSE"
      }
    }
  ],
  "totalElements": 15,
  "totalPages": 1,
  "searchQuery": "starbucks"
}
```

---

### 37. Filter Transactions

**Endpoint**: `GET /api/v1/transactions/filter`

**Description**: Advanced filtering of transactions

**Authentication**: Required (JWT)

**Query Parameters**:
- `categoryId` (integer, optional) - Filter by category
- `minAmount` (decimal, optional) - Minimum amount
- `maxAmount` (decimal, optional) - Maximum amount
- `startDate` (date, optional) - From date
- `endDate` (date, optional) - To date
- `merchantName` (string, optional) - Partial merchant name match
- `page` (integer, default: 0)
- `size` (integer, default: 20)
- `sort` (string, default: `transactionDate,desc`)

**Example Request**:
```http
GET /api/v1/transactions/filter?categoryId=3&minAmount=20&maxAmount=100&startDate=2025-01-01&endDate=2025-01-31
```

**Success Response** (200 OK):
```json
{
  "content": [
    {
      "id": 12,
      "amount": "45.67",
      "merchantName": "Whole Foods",
      "transactionDate": "2025-01-20",
      "category": {
        "id": 3,
        "name": "Groceries",
        "icon": "shopping-cart",
        "type": "EXPENSE"
      }
    }
  ],
  "filters": {
    "categoryId": 3,
    "minAmount": "20.00",
    "maxAmount": "100.00",
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  },
  "totalElements": 8,
  "totalPages": 1
}
```

---

## Export Endpoints

### 38. Export Transactions to CSV

**Endpoint**: `GET /api/v1/transactions/export/csv`

**Description**: Export transactions as CSV file

**Authentication**: Required (JWT)

**Query Parameters**:
- `startDate` (date, optional) - From date
- `endDate` (date, optional) - To date
- `categoryId` (integer, optional) - Filter by category

**Example Request**:
```http
GET /api/v1/transactions/export/csv?startDate=2025-01-01&endDate=2025-01-31
```

**Success Response** (200 OK):
```csv
Content-Type: text/csv
Content-Disposition: attachment; filename="transactions_2025-01-01_2025-01-31.csv"

Date,Merchant,Category,Amount,Description
2025-01-20,Whole Foods,Groceries,45.67,Weekly groceries
2025-01-19,Starbucks,Dining,5.50,Morning coffee
2025-01-18,Uber,Transport,12.00,
```

---

### 39. Export Budget Report to PDF

**Endpoint**: `GET /api/v1/budgets/export/pdf`

**Description**: Export budget report as PDF (Future feature)

**Authentication**: Required (JWT)

**Status**: Not implemented in MVP

**Planned Response** (200 OK):
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="budget_report_january_2025.pdf"

[PDF Binary Data]
```

---

## Health & Monitoring Endpoints

### 40. Health Check

**Endpoint**: `GET /actuator/health`

**Description**: Application health status

**Authentication**: None required (public endpoint)

**Success Response** (200 OK):
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "MySQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 499963174912,
        "free": 189425795072,
        "threshold": 10485760,
        "exists": true
      }
    },
    "ping": {
      "status": "UP"
    }
  }
}
```

---

### 41. Application Info

**Endpoint**: `GET /actuator/info`

**Description**: Application information and version

**Authentication**: None required (public endpoint)

**Success Response** (200 OK):
```json
{
  "app": {
    "name": "EasyTrack API",
    "description": "Personal Finance Tracker REST API",
    "version": "1.0.0",
    "encoding": "UTF-8",
    "java": {
      "version": "17.0.9"
    }
  }
}
```

---

## WebSocket Endpoints (Future Enhancement)

### 42. Real-time Transaction Updates

**Endpoint**: `ws://localhost:8080/ws/transactions`

**Description**: WebSocket connection for real-time transaction updates

**Authentication**: JWT token in connection handshake

**Status**: Not implemented in MVP (planned for v2)

**Usage Example**:
```javascript
const socket = new WebSocket('ws://localhost:8080/ws/transactions');

socket.onopen = () => {
  socket.send(JSON.stringify({
    type: 'AUTHENTICATE',
    token: accessToken
  }));
};

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'TRANSACTION_CREATED') {
    console.log('New transaction:', message.data);
    // Update UI
  }
};
```

---

## API Versioning

### Current Version: v1

All endpoints are prefixed with `/api/v1/`

### Version Lifecycle

| Version | Status | Release Date | End of Life |
|---------|--------|--------------|-------------|
| v1 | Current | 2025-01-27 | N/A |
| v2 | Planned | 2025-Q3 | N/A |

### Deprecation Policy

When a new version is released:
1. Previous version supported for **minimum 6 months**
2. Deprecation warnings added to response headers:
```http
   X-API-Deprecated: true
   X-API-Sunset-Date: 2025-12-31
```
3. Documentation clearly marks deprecated endpoints
4. Migration guide provided

### Breaking vs Non-Breaking Changes

**Non-Breaking (can be added to v1.x):**
- ✅ New endpoints
- ✅ New optional request parameters
- ✅ New fields in responses
- ✅ New error codes

**Breaking (requires v2):**
- ❌ Removing endpoints
- ❌ Removing request parameters
- ❌ Removing response fields
- ❌ Changing field types
- ❌ Changing URL structure
- ❌ Changing authentication method

---

## Request/Response Examples

### Example 1: Complete User Registration Flow

**Step 1: Register**
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah.johnson@example.com",
    "password": "SecurePass123!",
    "firstName": "Sarah",
    "lastName": "Johnson"
  }'
```

**Response**:
```json
{
  "message": "Registration successful",
  "user": {
    "id": 150,
    "email": "sarah.johnson@example.com",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "createdAt": "2025-01-20T14:30:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "expiresIn": 86400
}
```

**Step 2: Add First Transaction**
```bash
curl -X POST http://localhost:8080/api/v1/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..." \
  -d '{
    "amount": "3500.00",
    "categoryId": 1,
    "merchantName": "Acme Corp",
    "description": "January salary",
    "transactionDate": "2025-01-15"
  }'
```

**Response**:
```json
{
  "id": 1,
  "amount": "3500.00",
  "merchantName": "Acme Corp",
  "description": "January salary",
  "transactionDate": "2025-01-15",
  "category": {
    "id": 1,
    "name": "Salary",
    "icon": "dollar-sign",
    "type": "INCOME"
  },
  "createdAt": "2025-01-20T14:32:00Z"
}
```

**Step 3: Set Monthly Budget**
```bash
curl -X POST http://localhost:8080/api/v1/budgets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..." \
  -d '{
    "amount": "2000.00",
    "period": "MONTHLY",
    "startDate": "2025-01-01",
    "categoryId": null
  }'
```

**Step 4: View Dashboard**
```bash
curl -X GET http://localhost:8080/api/v1/dashboard/summary \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..."
```

---

### Example 2: CSV Import Flow

**Prepare CSV File** (`transactions.csv`):
```csv
Date,Description,Amount
2025-01-15,Acme Corp Salary,3500.00
2025-01-16,Whole Foods,45.67
2025-01-17,Starbucks,5.50
2025-01-18,Uber,12.00
```

**Upload CSV**:
```bash
curl -X POST http://localhost:8080/api/v1/transactions/import-csv \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..." \
  -F "file=@transactions.csv"
```

**Response**:
```json
{
  "message": "CSV import completed successfully",
  "summary": {
    "totalRows": 4,
    "imported": 4,
    "duplicates": 0,
    "errors": 0
  },
  "processingTime": "0.8 seconds"
}
```

---

### Example 3: Password Reset Flow

**Step 1: Request Reset**
```bash
curl -X POST http://localhost:8080/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah.johnson@example.com"
  }'
```

**Response**:
```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

**Step 2: User Receives Email**
```
Subject: Reset Your EasyTrack Password

Hi Sarah,

Click the link below to reset your password:
https://easytrack.com/reset-password?token=abc123-def456-ghi789

This link expires in 1 hour.
```

**Step 3: Reset Password**
```bash
curl -X POST http://localhost:8080/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123-def456-ghi789",
    "newPassword": "NewSecurePass456!"
  }'
```

**Response**:
```json
{
  "message": "Password reset successful. You can now log in with your new password."
}
```

---

## Frontend Integration Examples

### Angular Service Example
```typescript
// transaction.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private apiUrl = 'http://localhost:8080/api/v1/transactions';

  constructor(private http: HttpClient) {}

  getTransactions(page: number = 0, size: number = 20): Observable<PagedResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'transactionDate,desc');

    return this.http.get<PagedResponse>(this.apiUrl, { params });
  }

  createTransaction(transaction: CreateTransactionRequest): Observable {
    return this.http.post(this.apiUrl, transaction);
  }

  importCSV(file: File): Observable {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import-csv`, formData);
  }
}

// Component usage
this.transactionService.getTransactions(0, 20).subscribe({
  next: (response) => {
    this.transactions = response.content;
    this.totalPages = response.totalPages;
  },
  error: (error) => {
    console.error('Failed to load transactions', error);
  }
});
```

---

## Error Scenarios & Handling

### Scenario 1: Duplicate Email Registration

**Request**:
```json
POST /api/v1/auth/register
{
  "email": "existing@example.com",
  "password": "Test123!"
}
```

**Response** (409 Conflict):
```json
{
  "timestamp": "2025-01-20T14:30:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Email already registered",
  "path": "/api/v1/auth/register"
}
```

**Frontend Handling**:
```typescript
this.authService.register(data).subscribe({
  error: (err) => {
    if (err.status === 409) {
      this.errorMessage = 'This email is already registered. Please login instead.';
      this.showLoginLink = true;
    }
  }
});
```

---

### Scenario 2: Accessing Another User's Transaction

**Request**:
```http
GET /api/v1/transactions/9999
Authorization: Bearer 
```

Transaction ID 9999 belongs to user_456

**Response** (404 Not Found):
```json
{
  "timestamp": "2025-01-20T14:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Transaction not found or does not belong to user",
  "path": "/api/v1/transactions/9999"
}
```

**Security Note**: Returns 404 (not 403) to prevent information disclosure about existence of other users' transactions.

---

### Scenario 3: Expired JWT Token

**Request**:
```http
GET /api/v1/transactions
Authorization: Bearer 
```

**Response** (401 Unauthorized):
```json
{
  "timestamp": "2025-01-20T14:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token is expired",
  "path": "/api/v1/transactions"
}
```

**Frontend Handling**:
```typescript
// HTTP Interceptor
intercept(req: HttpRequest, next: HttpHandler): Observable<HttpEvent> {
  return next.handle(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && error.error.message.includes('expired')) {
        // Try to refresh token
        return this.authService.refreshToken().pipe(
          switchMap(newToken => {
            // Retry original request with new token
            const clonedRequest = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` }
            });
            return next.handle(clonedRequest);
          }),
          catchError(() => {
            // Refresh failed, redirect to login
            this.router.navigate(['/login']);
            return throwError(() => error);
          })
        );
      }
      return throwError(() => error);
    })
  );
}
```

---

## Performance Benchmarks

### Expected Response Times (95th Percentile)

| Endpoint | Expected Time | Notes |
|----------|---------------|-------|
| POST /auth/register | < 500ms | Includes BCrypt hashing |
| POST /auth/login | < 500ms | Includes BCrypt verification |
| GET /transactions (paginated) | < 200ms | With proper indexing |
| POST /transactions | < 150ms | Single insert |
| POST /transactions/import-csv | < 5s | For 1000 rows |
| GET /dashboard/summary | < 1500ms | Multiple aggregations |
| GET /statistics/* | < 800ms | Complex queries |

### Optimization Strategies

1. **Database Indexing**:
    - Compound index on `(user_id, transaction_date)`
    - Index on category foreign keys

2. **Query Optimization**:
    - Use JPA projections for aggregations
    - Avoid N+1 queries with JOIN FETCH

3. **Caching** (Future):
    - Redis for dashboard summary (5-minute TTL)
    - Invalidate on transaction create/update/delete

4. **Connection Pooling**:
    - HikariCP with pool size 10-20
    - Connection timeout: 30 seconds

---

## Testing Checklist

### API Testing with Postman/Swagger

- [ ] Register new user successfully
- [ ] Register with duplicate email (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail)
- [ ] Access protected endpoint without token (should fail)
- [ ] Access protected endpoint with valid token
- [ ] Create transaction
- [ ] Get all transactions (paginated)
- [ ] Update transaction
- [ ] Delete transaction
- [ ] Import CSV with valid data
- [ ] Import CSV with duplicates (should skip)
- [ ] Get dashboard summary
- [ ] Create budget
- [ ] Create savings goal
- [ ] Password reset flow
- [ ] Token refresh flow
- [ ] Rate limiting (exceed limit, should fail)

---

## Changelog

### v1.0.0 (2025-01-27) - Initial Release

**Added**:
- Authentication endpoints (register, login, refresh, forgot password, reset password)
- Transaction CRUD endpoints
- CSV import functionality
- Category management
- Budget management
- Dashboard summary
- Savings goals CRUD
- Debt management CRUD
- Statistics and reports
- Search and filter
- Export to CSV

**Security**:
- JWT authentication
- BCrypt password hashing
- Rate limiting
- CORS configuration

---

## Support & Contact

### Documentation
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **GitHub**: https://github.com/yourusername/easytrack-app
- **Issues**: https://github.com/yourusername/easytrack-app/issues

### Questions?
- Create an issue on GitHub
- Email: your.email@example.com

---

## License

This API is part of the EasyTrack project, licensed under the MIT License.

---
**Document Version**: 1.0  
**API Version**: v1