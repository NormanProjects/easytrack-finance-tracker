## Tables Overview

### 1. users
**Purpose**: Store user account information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email (login credential) |
| password_hash | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| first_name | VARCHAR(100) | - | User's first name |
| last_name | VARCHAR(100) | - | User's last name |
| oauth_provider | VARCHAR(50) | - | OAuth provider (GOOGLE, etc.) |
| oauth_id | VARCHAR(255) | - | Provider's user ID |
| profile_picture_url | VARCHAR(500) | - | Profile picture URL |
| is_email_verified | BOOLEAN | DEFAULT FALSE | Email verification status |
| is_active | BOOLEAN | DEFAULT TRUE | Account active status |
| created_at | TIMESTAMP | DEFAULT NOW | Account creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update timestamp |
| last_login_at | TIMESTAMP | - | Last login timestamp |

**Indexes:**
- `idx_email` on `email`
- `idx_oauth` on `(oauth_provider, oauth_id)`

**Business Rules:**
- Email must be unique across all users
- Password must be hashed with BCrypt (never store plain text)
- OAuth users may have NULL password_hash
- Soft delete: Set `is_active = false` instead of DELETE

---

### 2. categories
**Purpose**: Transaction categorization (predefined + custom)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique category identifier |
| user_id | BIGINT | FK → users.id | Owner (NULL for default categories) |
| name | VARCHAR(100) | NOT NULL | Category name |
| icon | VARCHAR(50) | - | Icon identifier (e.g., "shopping-cart") |
| type | ENUM | NOT NULL | INCOME or EXPENSE |
| is_default | BOOLEAN | DEFAULT FALSE | System-provided category |
| created_at | TIMESTAMP | DEFAULT NOW | Creation timestamp |

**Indexes:**
- `idx_user_category` on `(user_id, type)`

**Business Rules:**
- Default categories have `user_id = NULL` and `is_default = true`
- Users can create custom categories (max 50 per user)
- Cannot delete default categories
- Cannot delete category with existing transactions (FK constraint)

**Default Categories:**
```sql
-- System inserts on first deployment
INSERT INTO categories (name, icon, type, is_default) VALUES
('Salary', 'dollar-sign', 'INCOME', true),
('Freelance', 'briefcase', 'INCOME', true),
('Groceries', 'shopping-cart', 'EXPENSE', true),
('Dining', 'utensils', 'EXPENSE', true),
('Transport', 'car', 'EXPENSE', true),
('Entertainment', 'film', 'EXPENSE', true),
('Utilities', 'zap', 'EXPENSE', true),
('Healthcare', 'heart', 'EXPENSE', true),
('Shopping', 'shopping-bag', 'EXPENSE', true),
('Other', 'more-horizontal', 'EXPENSE', true);
```

---

### 3. transactions
**Purpose**: Store all income and expense records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique transaction identifier |
| user_id | BIGINT | FK → users.id, NOT NULL | Transaction owner |
| category_id | BIGINT | FK → categories.id, NOT NULL | Category classification |
| amount | DECIMAL(12,2) | NOT NULL | Transaction amount (positive) |
| merchant_name | VARCHAR(255) | - | Merchant/payee name |
| description | TEXT | - | Additional notes |
| transaction_date | DATE | NOT NULL | Date of transaction |
| created_at | TIMESTAMP | DEFAULT NOW | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last modification time |

**Indexes:**
- `idx_user_date` on `(user_id, transaction_date)` - **Most important for dashboard queries**
- `idx_user_category` on `(user_id, category_id)` - For category reports

**Business Rules:**
- Amount always stored as positive (type determined by category)
- CSV imports deduplicate on `(user_id, amount, transaction_date, merchant_name)`
- Merchant names cleaned before insert (remove "SQ *", location codes, etc.)
- Soft delete preferred (add `deleted_at` column in future)

**Performance Notes:**
- Compound index `(user_id, transaction_date)` supports:
```sql
  SELECT * FROM transactions WHERE user_id = ? AND transaction_date BETWEEN ? AND ?
```
- Estimated 10,000+ rows per user (indexed for fast queries)

---

### 4. budgets
**Purpose**: Monthly/yearly spending limits

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique budget identifier |
| user_id | BIGINT | FK → users.id, NOT NULL | Budget owner |
| category_id | BIGINT | FK → categories.id | Specific category (NULL = overall) |
| amount | DECIMAL(12,2) | NOT NULL | Budget amount |
| period | ENUM | DEFAULT 'MONTHLY' | MONTHLY or YEARLY |
| start_date | DATE | NOT NULL | Budget start date |
| end_date | DATE | - | Budget end date (NULL = ongoing) |
| created_at | TIMESTAMP | DEFAULT NOW | Creation timestamp |

**Indexes:**
- `idx_user_period` on `(user_id, start_date, end_date)`

**Business Rules:**
- Only one active budget per category per period
- `category_id = NULL` means overall budget (all expenses)
- Dashboard calculates: `safe_to_spend = (budget - spent) / days_remaining`

---

### 5. savings_goals
**Purpose**: Track savings targets

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique goal identifier |
| user_id | BIGINT | FK → users.id, NOT NULL | Goal owner |
| name | VARCHAR(255) | NOT NULL | Goal name (e.g., "Vacation Fund") |
| target_amount | DECIMAL(12,2) | NOT NULL | Target savings amount |
| current_amount | DECIMAL(12,2) | DEFAULT 0 | Current progress |
| monthly_contribution | DECIMAL(12,2) | - | Expected monthly savings |
| target_date | DATE | - | Goal completion date |
| created_at | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update timestamp |

**Indexes:**
- `idx_user_goal` on `user_id`

**Business Rules:**
- User manually updates `current_amount` (not auto-calculated in MVP)
- Estimated completion = `(target_amount - current_amount) / monthly_contribution` months
- Dashboard shows single most important goal (highest priority or closest to completion)

---

### 6. debts
**Purpose**: Track debt accounts and payoff

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique debt identifier |
| user_id | BIGINT | FK → users.id, NOT NULL | Debt owner |
| name | VARCHAR(255) | NOT NULL | Debt name (e.g., "Student Loan") |
| original_amount | DECIMAL(12,2) | NOT NULL | Initial debt amount |
| current_balance | DECIMAL(12,2) | NOT NULL | Remaining balance |
| interest_rate | DECIMAL(5,2) | - | Annual interest rate (%) |
| minimum_payment | DECIMAL(12,2) | - | Minimum monthly payment |
| due_date | DATE | - | Payment due date |
| created_at | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update timestamp |

**Indexes:**
- `idx_user_debt` on `user_id`

**Business Rules:**
- User manually updates `current_balance` after payments
- Dashboard calculates debt-free date based on payment velocity
- Interest calculation: Simple interest for MVP (compound in future)

---

### 7. password_reset_tokens
**Purpose**: Secure password reset flow

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Token identifier |
| user_id | BIGINT | FK → users.id, NOT NULL | User requesting reset |
| token | VARCHAR(255) | UNIQUE, NOT NULL | Reset token (UUID) |
| expires_at | TIMESTAMP | NOT NULL | Token expiration (1 hour) |
| used_at | TIMESTAMP | - | Token usage timestamp |
| created_at | TIMESTAMP | DEFAULT NOW | Token creation time |

**Indexes:**
- `idx_token` on `token` (for fast lookup)
- `idx_user_id` on `user_id`

**Business Rules:**
- Token expires after 1 hour
- Token is single-use only (`used_at` prevents reuse)
- Old tokens are deleted after 24 hours (cleanup job)

---

### 8. refresh_tokens
**Purpose**: JWT refresh token management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Token identifier |
| user_id | BIGINT | FK → users.id, NOT NULL | Token owner |
| token | VARCHAR(500) | UNIQUE, NOT NULL | Refresh token (JWT) |
| expires_at | TIMESTAMP | NOT NULL | Token expiration (30 days) |
| revoked | BOOLEAN | DEFAULT FALSE | Token revocation status |
| created_at | TIMESTAMP | DEFAULT NOW | Token creation time |

**Indexes:**
- `idx_token` on `token`
- `idx_user_id` on `user_id`

**Business Rules:**
- Refresh token valid for 30 days
- On refresh, old token revoked and new one issued (token rotation)
- On logout, revoke all user's refresh tokens
- Revoked tokens cannot be used

---

## Relationships
```
users (1) ──< (M) transactions
users (1) ──< (M) categories
users (1) ──< (M) budgets
users (1) ──< (M) savings_goals
users (1) ──< (M) debts
users (1) ──< (M) password_reset_tokens
users (1) ──< (M) refresh_tokens

categories (1) ──< (M) transactions
categories (1) ──< (M) budgets

### Repository Layer Enforcement
```java
// All queries include userId
@Query("SELECT t FROM Transaction t WHERE t.userId = :userId AND t.id = :id")
Optional findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);
```

---

## Sample Data (For Testing)
```sql
-- Sample user
INSERT INTO users (email, password_hash, first_name, last_name) VALUES
('john@example.com', '$2a$12$...', 'John', 'Doe');

-- Sample transactions
INSERT INTO transactions (user_id, category_id, amount, merchant_name, transaction_date) VALUES
(1, 3, 45.67, 'Whole Foods', '2025-01-15'),
(1, 4, 23.50, 'Starbucks', '2025-01-16'),
(1, 5, 12.00, 'Uber', '2025-01-17');

-- Sample budget
INSERT INTO budgets (user_id, amount, period, start_date) VALUES
(1, 2000.00, 'MONTHLY', '2025-01-01');
```

---

## Migration Strategy (Flyway)

### V1__Create_users_table.sql
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    profile_picture_url VARCHAR(500),
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_oauth (oauth_provider, oauth_id)
);
```

### V2__Create_categories_table.sql
```sql
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    type ENUM('INCOME', 'EXPENSE') NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_category (user_id, type)
);

-- Insert default categories
INSERT INTO categories (name, icon, type, is_default) VALUES
('Salary', 'dollar-sign', 'INCOME', true),
('Freelance', 'briefcase', 'INCOME', true),
('Groceries', 'shopping-cart', 'EXPENSE', true),
('Dining', 'utensils', 'EXPENSE', true),
('Transport', 'car', 'EXPENSE', true),
('Entertainment', 'film', 'EXPENSE', true),
('Utilities', 'zap', 'EXPENSE', true),
('Healthcare', 'heart', 'EXPENSE', true),
('Shopping', 'shopping-bag', 'EXPENSE', true),
('Other', 'more-horizontal', 'EXPENSE', true);
```

### V3__Create_transactions_table.sql
```sql
CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    merchant_name VARCHAR(255),
    description TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_user_date (user_id, transaction_date),
    INDEX idx_user_category (user_id, category_id)
);
```

(Continue for remaining tables...)

---

## Performance Considerations

### Query Optimization
1. **Most Frequent Query** (Dashboard):
```sql
   SELECT SUM(amount) FROM transactions 
   WHERE user_id = ? AND transaction_date BETWEEN ? AND ?
```
→ Optimized by `idx_user_date` compound index

2. **Second Most Frequent** (Transaction List):
```sql
   SELECT * FROM transactions 
   WHERE user_id = ? 
   ORDER BY transaction_date DESC 
   LIMIT 20 OFFSET 0
```
→ Also uses `idx_user_date`

### Index Cardinality
- `user_id`: High selectivity (each user has unique ID)
- `transaction_date`: Medium selectivity
- Compound `(user_id, transaction_date)`: Very high selectivity

### Scaling Strategy
- **Current**: Single MySQL instance (handles 100 users, 100K transactions)
- **Future**: Read replicas for reporting queries
- **Future**: Partition transactions table by date (yearly partitions)