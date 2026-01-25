# EasyTrack Backend

A secure, production-ready personal finance tracking REST API built with Spring Boot 4.0.1, featuring JWT authentication, comprehensive budgeting tools, and a Copilot-inspired dashboard.

##  Features

### Core Functionality
-  **JWT Authentication** - Secure token-based authentication
-  **Multi-User Support** - Complete data isolation between users
-  **Transaction Management** - Full CRUD for income/expense tracking
-  **Account Management** - Multiple account types (Cash, Bank, Credit Card, Savings, Investment)
-  **Category System** - Predefined and custom categories with icons
-  **Budget Tracking** - Daily/Weekly/Monthly/Yearly budgets with progress monitoring
-  **Recurring Transactions** - Automated recurring income/expense processing
-  **Dashboard API** - Comprehensive financial summary endpoint

### Security Features
-  **BCrypt Password Hashing**
-  **Stateless JWT Authentication**
-  **CORS Configuration**
-  **Data Isolation** - Users can only access their own data
-  **Global Exception Handling**

### Technical Highlights
-  **OpenAPI/Swagger Documentation** - Auto-generated API docs
- ️ **Layered Architecture** - Controller → Service → Repository → Entity
-  **DTO Pattern** - Clean separation of concerns
-  **Lombok** - Reduced boilerplate code
-  **Transaction Management** - ACID compliance

##  Prerequisites

- **Java 17** or higher
- **Maven 3.8+**
- **MySQL 8.0+**
- **Git**

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd easytrack-backend
```

### 2. Create MySQL Database
```sql
CREATE DATABASE easytrack_db;
```

### 3. Configure Application Properties

Edit `src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/easytrack_db
spring.datasource.username=your_username
spring.datasource.password=your_password

# JWT Secret (IMPORTANT: Generate a secure 256-bit key)
# Generate using: openssl rand -base64 32
jwt.secret=your-secure-256-bit-secret-key-here-minimum-32-characters

# CORS Configuration (Update for production)
cors.allowed-origins=http://localhost:4200
```

### 4. Build the Project
```bash
mvn clean install
```

### 5. Run the Application
```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

##  API Documentation

Once running, access the Swagger UI at:
```
http://localhost:8080/swagger-ui.html
```

##  API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and receive JWT token

### Dashboard
- `GET /api/dashboard/summary` - Get comprehensive financial dashboard

### Transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions` - Get all user's transactions
- `GET /api/transactions/{id}` - Get specific transaction
- `GET /api/transactions/date-range` - Get transactions by date range
- `GET /api/transactions/summary` - Get income/expense summary
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Accounts
- `POST /api/accounts` - Create account
- `GET /api/accounts` - Get all user's accounts
- `GET /api/accounts/active` - Get active accounts
- `GET /api/accounts/total-balance` - Get total balance
- `PUT /api/accounts/{id}` - Update account
- `DELETE /api/accounts/{id}` - Delete account

### Categories
- `POST /api/categories` - Create category
- `GET /api/categories` - Get all user's categories
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets` - Get all user's budgets
- `GET /api/budgets/active` - Get active budgets
- `GET /api/budgets/current` - Get current period budgets
- `GET /api/budgets/{id}/progress` - Get budget progress percentage
- `POST /api/budgets/refresh` - Refresh all budget calculations
- `PUT /api/budgets/{id}` - Update budget
- `DELETE /api/budgets/{id}` - Delete budget

### Recurring Transactions
- `POST /api/recurring-transactions` - Create recurring transaction
- `GET /api/recurring-transactions` - Get all recurring transactions
- `POST /api/recurring-transactions/process` - Process due recurring transactions

##  Authentication Flow

### 1. Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

### 2. Use Token in Requests
```bash
GET /api/transactions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ️ Project Structure

```
src/main/java/com/easytrack/backend/
├── config/                 # Configuration classes
│   ├── CorsConfig.java
│   └── SecurityConfig.java
├── controller/            # REST Controllers
│   ├── AuthController.java
│   ├── AccountController.java
│   ├── BudgetController.java
│   ├── CategoryController.java
│   ├── DashboardController.java
│   ├── RecurringTransactionController.java
│   ├── TransactionController.java
│   └── UserController.java
├── dto/                   # Data Transfer Objects
│   ├── AccountDTO.java
│   ├── AuthResponse.java
│   ├── BudgetDTO.java
│   ├── CategoryDTO.java
│   ├── DashboardSummaryDTO.java
│   ├── ErrorResponse.java
│   ├── LoginRequest.java
│   ├── RegisterRequest.java
│   ├── TransactionDTO.java
│   └── TransactionSummaryDTO.java
├── entity/                # JPA Entities
│   ├── Account.java
│   ├── Budget.java
│   ├── Category.java
│   ├── RecurringTransaction.java
│   ├── Transaction.java
│   └── User.java
├── exception/             # Custom Exceptions
│   ├── BadRequestException.java
│   ├── DuplicateResourceException.java
│   ├── GlobalExceptionHandler.java
│   ├── InsufficientBalanceException.java
│   ├── ResourceNotFoundException.java
│   └── UnauthorizedException.java
├── mapper/                # Entity-DTO Mappers
│   ├── AccountMapper.java
│   ├── BudgetMapper.java
│   ├── CategoryMapper.java
│   ├── TransactionMapper.java
│   └── UserMapper.java
├── repository/            # JPA Repositories
│   ├── AccountRepository.java
│   ├── BudgetRepository.java
│   ├── CategoryRepository.java
│   ├── RecurringTransactionRepository.java
│   ├── TransactionRepository.java
│   └── UserRepository.java
├── security/              # Security Components
│   ├── CustomUserDetailsService.java
│   ├── JwtAuthenticationFilter.java
│   └── JwtUtil.java
├── service/               # Business Logic
│   ├── AccountService.java
│   ├── AuthService.java
│   ├── BudgetService.java
│   ├── CategoryService.java
│   ├── DashboardService.java
│   ├── RecurringTransactionService.java
│   ├── TransactionService.java
│   └── UserService.java
└── util/                  # Utility Classes
    └── SecurityUtil.java
```

##  Next Steps

### Recommended Priority:
1.  **Security is FIXED** - All controllers now extract userId from JWT
2.  **Dashboard Endpoint** - Complete Copilot-inspired summary
3.  **Secure All Controllers** - Apply SecurityUtil to Category, RecurringTransaction controllers
4.  **CSV Import Feature** - Bulk transaction import with deduplication
5.  **Unit Tests** - Add comprehensive test coverage
6.  **Frontend Integration** - Connect Angular application
7.  **Deployment** - Deploy to cloud (AWS/Azure/Heroku)

##  Troubleshooting

### Database Connection Issues
```bash
# Verify MySQL is running
mysql -u root -p

# Check database exists
SHOW DATABASES;
```

### JWT Token Issues
- Ensure `jwt.secret` is at least 32 characters
- Check token expiration (default: 24 hours)
- Verify `Authorization` header format: `Bearer <token>`

### CORS Errors
- Update `cors.allowed-origins` in `application.properties`
- For development: `http://localhost:4200`
- For production: Your deployed frontend URL

## License

This project is for portfolio/educational purposes.

##  Developer

Built as a full-stack portfolio project demonstrating:
- Spring Boot ecosystem mastery
- RESTful API design
- JWT security implementation
- Clean architecture principles
- Database design and optimization

---

