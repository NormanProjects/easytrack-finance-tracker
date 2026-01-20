# System Architecture Design

## Overview

EasyTrack follows a **layered architecture** pattern with clear separation of concerns. The system is built as a **Single Page Application (SPA)** frontend communicating with a **RESTful API** backend.

---

## Architecture Diagrams

### 1. High-Level System Architecture

![System Architecture](assets/system-architecture.png)

**Description:**

The system consists of 4 primary layers:

1. **Client Layer**: Web browsers (desktop, mobile, tablet)
2. **Presentation Layer**: Angular SPA + Static landing page
3. **Application Layer**: Spring Boot backend with layered architecture
4. **Data Layer**: MySQL relational database

**Communication Protocol:**
- Frontend ↔ Backend: HTTPS REST API with JWT authentication
- Backend ↔ Database: JDBC connection pool

---

### 2. Authentication Flow

![Authentication Flow](assets/authentication-flow.png)

**Login Flow Steps:**

1. User submits email/password in Angular app
2. Angular sends POST /api/v1/auth/login
3. Spring Security validates credentials
4. Backend queries MySQL for user record
5. BCrypt verifies password hash
6. JWT token generated (valid 24 hours)
7. Token returned to Angular
8. Angular stores token (localStorage or memory)
9. Angular redirects to /dashboard
10. All subsequent requests include JWT in Authorization header

**Security Notes:**
- Password never transmitted in plain text (HTTPS only)
- JWT contains: userId, email, issuedAt, expiresAt
- Token validation on every protected endpoint
- Invalid/expired tokens return 401 Unauthorized

---

### 3. Backend Component Architecture

![Component Diagram](assets/backend-component-diagram.png)

**Layer Responsibilities:**

#### Configuration Layer (@Configuration)
- **SecurityConfig**: JWT authentication, CORS, password encoder
- **CorsConfig**: Allowed origins, methods, headers
- **JwtConfig**: Secret key, expiration times

#### Controller Layer (@RestController)
- **Responsibilities**: HTTP request/response handling, input validation
- **Components**:
    - AuthController: `/api/v1/auth/*`
    - TransactionController: `/api/v1/transactions/*`
    - DashboardController: `/api/v1/dashboard/*`
    - BudgetController: `/api/v1/budgets/*`

#### Service Layer (@Service)
- **Responsibilities**: Business logic, data validation, calculations
- **Components**:
    - AuthService: User registration, login, JWT generation
    - TransactionService: CRUD operations, data isolation
    - DashboardService: Aggregations, budget calculations
    - CSVImportService: File parsing, deduplication, merchant cleaning

#### Repository Layer (@Repository)
- **Responsibilities**: Database access via Spring Data JPA
- **Components**:
    - UserRepository: User CRUD + custom queries
    - TransactionRepository: Transaction queries with userId filtering
    - CategoryRepository: Category management
    - BudgetRepository: Budget queries

#### Entity Layer (@Entity)
- **Responsibilities**: JPA entities mapping to database tables
- **Components**:
    - User, Transaction, Category, Budget, SavingsGoal, Debt
    - Annotations: @Entity, @Table, @Column, @Id, @GeneratedValue

#### DTO Layer
- **Responsibilities**: Data transfer objects for API contracts
- **Components**:
    - Request DTOs: RegisterRequest, LoginRequest, TransactionRequest
    - Response DTOs: AuthResponse, TransactionResponse, DashboardSummaryResponse

---

### 4. Deployment Architecture

![Deployment Diagram](assets/deployment-architecture.png)

**Production Deployment (Docker Compose):**
```yaml
services:
  frontend:
    - Nginx web server
    - Angular production build
    - Port: 80 (HTTP) / 443 (HTTPS)
    
  backend:
    - Spring Boot JAR
    - JRE 17
    - Port: 8080
    
  database:
    - MySQL 8.0
    - Port: 3306
    - Volume: /var/lib/mysql (persistent storage)
```

**Development Environment:**
- IntelliJ IDEA: Backend development (port 8080)
- VS Code: Frontend development (port 4200)
- MySQL Workbench: Database management (port 3306)

---

## Design Patterns Used

### 1. Layered Architecture
**Purpose**: Separation of concerns, maintainability
```
Controller → Service → Repository → Entity
```

**Benefits:**
- Each layer has single responsibility
- Easy to test (mock dependencies)
- Can swap implementations (e.g., different database)

### 2. Repository Pattern
**Purpose**: Abstract data access logic
```java
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);
}
```

**Benefits:**
- Decouples business logic from data access
- Enables easy testing with mocks
- Provides consistent query interface

### 3. DTO Pattern
**Purpose**: Separate internal entities from API contracts
```java
// Entity (internal)
@Entity
public class User {
    private String passwordHash; // Never exposed
}

// DTO (external)
public class UserResponse {
    private String email; // Password excluded
}
```

**Benefits:**
- Security: Never expose sensitive fields
- Flexibility: API can differ from database structure
- Versioning: Change DTOs without changing entities

### 4. Dependency Injection
**Purpose**: Loose coupling, testability
```java
@Service
public class TransactionService {
    @Autowired
    private TransactionRepository repository; // Injected by Spring
}
```

**Benefits:**
- Easy to mock for unit tests
- Promotes interface-based programming
- Managed by Spring container

---

## Technology Decisions

### Why Spring Boot?
 Production-ready features (Actuator, security)  
 Large ecosystem (Spring Data, Spring Security)  
 Industry standard (high demand in job market)  
 Excellent documentation and community support

### Why Angular?
 TypeScript = type safety  
 RxJS = reactive programming (perfect for real-time updates)  
 Strong CLI tooling  
 Enterprise adoption

### Why MySQL?
 ACID compliance (financial data must be consistent)  
 Proven reliability  
 Good performance with proper indexing  
 Familiar to most developers

### Why JWT?
 Stateless (scales horizontally)  
 No server-side session storage  
 Works across domains  
 Industry standard

---

## Security Architecture

### Authentication Flow
1. User submits credentials
2. Backend validates with BCrypt
3. JWT token generated (HS512 algorithm)
4. Token includes: userId, email, exp
5. Token sent to frontend
6. Frontend includes token in Authorization header
7. Backend validates token on each request

### Authorization Strategy
- **Role-Based**: Not implemented in MVP (all users have same permissions)
- **Data Isolation**: Every query filtered by userId
- **Resource Ownership**: Users can only access their own data

### Security Measures
-  Passwords hashed with BCrypt (cost factor 12)
-  JWT tokens signed with secret key (256-bit minimum)
-  HTTPS enforced in production
-  CORS restricted to frontend domain
-  SQL injection prevented (JPA parameterized queries)
-  XSS prevented (Angular sanitizes HTML by default)
-  CSRF not needed (stateless API, no cookies)

---

## Data Flow Examples

### Example 1: Add Transaction
```
User → Angular → Backend → Database

1. User fills form in Angular
2. Angular validates input (client-side)
3. Angular sends POST /api/v1/transactions
   Headers: { Authorization: "Bearer <jwt>" }
   Body: {
     "amount": 45.67,
     "categoryId": 3,
     "merchantName": "Starbucks",
     "transactionDate": "2025-01-20"
   }
4. Spring Security validates JWT
5. Controller extracts userId from JWT
6. Controller calls TransactionService.create(userId, dto)
7. Service validates business rules
8. Repository saves to database
9. Response sent back to Angular
10. Angular updates UI via RxJS Subject (no page reload)
```

### Example 2: Dashboard Load
```
1. User navigates to /dashboard
2. Angular route guard checks JWT validity
3. If valid, loads DashboardComponent
4. Component calls DashboardService.getSummary()
5. Angular sends GET /api/v1/dashboard/summary
6. Backend validates JWT, extracts userId
7. DashboardService runs 4 queries:
   - Current month spending
   - Previous month spending
   - Active budget
   - Savings goal progress
8. Service calculates:
   - leftToSpend = budget - spending
   - safeToSpendDaily = leftToSpend / daysRemaining
9. Response sent as JSON
10. Angular displays dashboard cards
```

### Example 3: CSV Import
```
1. User uploads CSV file (drag-and-drop)
2. Angular creates FormData with file
3. POST /api/v1/transactions/import-csv
4. CSVImportService.importCSV(userId, file)
5. Service parses CSV (Apache Commons CSV)
6. For each row:
   - Clean merchant name ("SQ *STARBUCKS" → "Starbucks")
   - Check for duplicate (userId + amount + date + merchant)
   - If not duplicate, create Transaction entity
7. Batch insert all transactions (JPA saveAll)
8. Return import summary (total, imported, duplicates)
9. Angular displays success message
10. Dashboard auto-refreshes
```

---

## Performance Considerations

### Backend Optimizations
1. **Database Indexing**:
    - Compound index: (user_id, transaction_date)
    - Enables fast dashboard queries

2. **JPA Projections**:
```java
   // Instead of loading full entities
   @Query("SELECT SUM(t.amount) FROM Transaction t WHERE ...")
   BigDecimal sumExpenses();
```

3. **Connection Pooling**:
    - HikariCP (default in Spring Boot)
    - Pool size: 10-20 connections

4. **Caching** (Future):
    - Spring Cache for dashboard summary
    - Invalidate on transaction add/update/delete

### Frontend Optimizations
1. **Lazy Loading**:
    - Route-based code splitting
    - Load feature modules on demand

2. **RxJS Operators**:
    - debounceTime for search
    - shareReplay for cached observables

3. **Change Detection**:
    - OnPush strategy for list components
    - Reduces unnecessary re-renders

---

## Scalability Strategy

### Current (MVP)
- **Users**: 1-100 concurrent
- **Transactions**: 100K+ per user
- **Deployment**: Single server (all-in-one)

### Future (Scale-Up)
- **Database**: Read replicas for reports
- **Caching**: Redis for session data
- **CDN**: CloudFront for static assets
- **Load Balancer**: Multiple backend instances

### Future (Scale-Out)
- **Microservices**: Split into Auth, Transactions, Analytics services
- **Message Queue**: RabbitMQ for async processing
- **Event Sourcing**: For audit trail
- **CQRS**: Separate read/write models

---

## Error Handling Strategy

### Backend
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(Exception ex) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse("Resource not found", ex.getMessage()));
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(Exception ex) {
        return ResponseEntity.status(400)
            .body(new ErrorResponse("Validation failed", ex.getMessage()));
    }
}
```

### Frontend
```typescript
this.transactionService.create(data).subscribe({
  next: (transaction) => {
    this.showSuccess('Transaction added!');
  },
  error: (error) => {
    if (error.status === 400) {
      this.showError('Invalid data. Please check your input.');
    } else if (error.status === 401) {
      this.router.navigate(['/login']);
    } else {
      this.showError('Something went wrong. Please try again.');
    }
  }
});
```

---

## Logging Strategy

### What to Log
-  All authentication attempts (success/failure)
-  All API requests (endpoint, userId, timestamp)
-  All errors with stack traces
-  Performance metrics (query execution time)
-  Never log passwords