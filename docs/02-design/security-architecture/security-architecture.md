# Security Architecture

## Document Control
- **Project**: EasyTrack Security Design
- **Version**: 1.0
- **Date**: January 2025
- **Status**: Design Phase

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication Architecture](#authentication-architecture)
3. [Authorization & Data Isolation](#authorization--data-isolation)
4. [Password Security](#password-security)
5. [Transport Security](#transport-security)
6. [Input Validation & Sanitization](#input-validation--sanitization)
7. [SQL Injection Prevention](#sql-injection-prevention)
8. [XSS & CSRF Protection](#xss--csrf-protection)
9. [Rate Limiting](#rate-limiting)
10. [Security Headers](#security-headers)
11. [Error Handling & Information Disclosure](#error-handling--information-disclosure)
12. [Threat Model](#threat-model)
13. [Security Testing Strategy](#security-testing-strategy)
14. [Compliance & Best Practices](#compliance--best-practices)

---

## Security Overview

### Security Philosophy

EasyTrack follows a **"Privacy-First, Security-by-Default"** approach:

1. **No Bank Integration**: Users maintain complete control over their financial data
2. **Zero Trust**: Every request is authenticated and authorized
3. **Data Isolation**: Users cannot access other users' data under any circumstance
4. **Minimal Data Collection**: We only collect what's necessary
5. **Transparency**: Open-source code allows security audits

### Security Layers
```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Transport Security (HTTPS/TLS)                 │
├─────────────────────────────────────────────────────────┤
│ Layer 2: CORS & Security Headers                        │
├─────────────────────────────────────────────────────────┤
│ Layer 3: Rate Limiting                                  │
├─────────────────────────────────────────────────────────┤
│ Layer 4: Authentication (JWT)                           │
├─────────────────────────────────────────────────────────┤
│ Layer 5: Authorization (userId filtering)               │
├─────────────────────────────────────────────────────────┤
│ Layer 6: Input Validation                               │
├─────────────────────────────────────────────────────────┤
│ Layer 7: SQL Injection Prevention (JPA)                 │
├─────────────────────────────────────────────────────────┤
│ Layer 8: Error Handling (No information disclosure)     │
└─────────────────────────────────────────────────────────┘
```

### Security Requirements Summary

| Requirement | Implementation | Priority | Status |
|-------------|----------------|----------|--------|
| Password Security | BCrypt (cost 12) | Critical | ✅ Planned |
| Authentication | JWT (HS512) | Critical | ✅ Planned |
| Data Isolation | userId filtering | Critical | ✅ Planned |
| Transport Encryption | HTTPS (TLS 1.3) | Critical | ✅ Planned |
| SQL Injection Prevention | JPA parameterized queries | Critical | ✅ Planned |
| XSS Prevention | Angular sanitization | High | ✅ Planned |
| Rate Limiting | Spring filters | High | ✅ Planned |
| Input Validation | Bean Validation (JSR-380) | High | ✅ Planned |
| CSRF Protection | Not needed (stateless) | N/A | ✅ N/A |
| Session Management | Stateless (JWT) | High | ✅ Planned |
| Error Handling | Generic messages | Medium | ✅ Planned |
| Security Headers | Helmet.js patterns | Medium | ✅ Planned |

---

## Authentication Architecture

### JWT Token-Based Authentication

#### Why JWT Over Sessions?

| Feature | JWT (Chosen) | Session Cookies |
|---------|--------------|-----------------|
| Stateless | ✅ Yes | ❌ No (server-side storage) |
| Scalability | ✅ Horizontal scaling easy | ❌ Requires sticky sessions |
| Cross-domain | ✅ Works across domains | ⚠️ Requires CORS config |
| Mobile apps | ✅ Easy integration | ⚠️ Cookie handling complex |
| Microservices | ✅ Any service can validate | ❌ Centralized session store needed |
| Logout | ⚠️ Token blacklist needed | ✅ Simple (destroy session) |

#### JWT Token Structure

**Header:**
```json
{
  "alg": "HS512",
  "typ": "JWT"
}
```

**Payload (Claims):**
```json
{
  "sub": "user@example.com",
  "userId": 123,
  "iat": 1704067200,
  "exp": 1704153600,
  "type": "ACCESS"
}
```

**Signature:**
```
HMACSHA512(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  SECRET_KEY
)
```

**Complete Token:**
```
eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwidXNlcklkIjoxMjMsImlhdCI6MTcwNDA2NzIwMCwiZXhwIjoxNzA0MTUzNjAwLCJ0eXBlIjoiQUNDRVNTIn0.
[signature]
```

#### Token Configuration

**Access Token:**
- **Lifetime**: 24 hours
- **Purpose**: Authenticate API requests
- **Storage**: Frontend memory/sessionStorage
- **Refresh**: Via refresh token when expired

**Refresh Token:**
- **Lifetime**: 30 days
- **Purpose**: Obtain new access tokens
- **Storage**: HttpOnly cookie (preferred) or localStorage
- **Rotation**: New refresh token issued on each refresh

**Secret Key Requirements:**
- **Length**: Minimum 256 bits (32 bytes)
- **Randomness**: Cryptographically secure random generator
- **Storage**: Environment variable (NEVER in code)
- **Rotation**: Change every 90 days in production

#### Token Validation Flow
```java
// JwtTokenProvider.java
public boolean validateToken(String token) {
    try {
        Claims claims = Jwts.parser()
            .setSigningKey(jwtSecret)
            .parseClaimsJws(token)
            .getBody();
        
        // Check expiration
        if (claims.getExpiration().before(new Date())) {
            log.warn("JWT token expired for user: {}", claims.getSubject());
            return false;
        }
        
        // Check token type
        if (!"ACCESS".equals(claims.get("type"))) {
            log.warn("Invalid token type: {}", claims.get("type"));
            return false;
        }
        
        return true;
        
    } catch (SignatureException e) {
        log.error("Invalid JWT signature: {}", e.getMessage());
        return false;
    } catch (MalformedJwtException e) {
        log.error("Invalid JWT token: {}", e.getMessage());
        return false;
    } catch (ExpiredJwtException e) {
        log.error("JWT token is expired: {}", e.getMessage());
        return false;
    } catch (UnsupportedJwtException e) {
        log.error("JWT token is unsupported: {}", e.getMessage());
        return false;
    } catch (IllegalArgumentException e) {
        log.error("JWT claims string is empty: {}", e.getMessage());
        return false;
    }
}
```

#### Authentication Flow Diagram
```
User                    Angular                Backend              Database
 │                         │                       │                    │
 │  1. Enter credentials   │                       │                    │
 ├────────────────────────>│                       │                    │
 │                         │                       │                    │
 │                         │ 2. POST /auth/login   │                    │
 │                         ├──────────────────────>│                    │
 │                         │   { email, password } │                    │
 │                         │                       │                    │
 │                         │                       │ 3. Query user      │
 │                         │                       ├───────────────────>│
 │                         │                       │                    │
 │                         │                       │<───────────────────┤
 │                         │                       │ User record        │
 │                         │                       │                    │
 │                         │                       │ 4. Verify BCrypt   │
 │                         │                       │    password        │
 │                         │                       │                    │
 │                         │                       │ 5. Generate JWT    │
 │                         │                       │    tokens          │
 │                         │                       │                    │
 │                         │<──────────────────────┤                    │
 │                         │ 6. { accessToken,     │                    │
 │                         │      refreshToken }   │                    │
 │                         │                       │                    │
 │<────────────────────────┤                       │                    │
 │ 7. Redirect to dashboard│                       │                    │
 │                         │                       │                    │
 │                         │ 8. GET /dashboard     │                    │
 │                         │    Authorization:     │                    │
 │                         │    Bearer <token>     │                    │
 │                         ├──────────────────────>│                    │
 │                         │                       │                    │
 │                         │                       │ 9. Validate JWT    │
 │                         │                       │    Extract userId  │
 │                         │                       │                    │
 │                         │                       │ 10. Query data     │
 │                         │                       ├───────────────────>│
 │                         │                       │    WHERE user_id=? │
 │                         │                       │                    │
 │                         │                       │<───────────────────┤
 │                         │<──────────────────────┤                    │
 │                         │ 11. Dashboard data    │                    │
 │<────────────────────────┤                       │                    │
 │ 12. Display dashboard   │                       │                    │
```

---

## Authorization & Data Isolation

### Multi-Tenant Security Model

**Critical Principle**: **Every user is a separate tenant. No shared data.**

#### Implementation Strategy

**Layer 1: Repository Level (Database Queries)**
```java
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    // ❌ WRONG - Exposes all users' data
    List<Transaction> findAll();
    
    // ✅ CORRECT - Always filter by userId
    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId")
    List<Transaction> findByUserId(@Param("userId") Long userId);
    
    // ✅ CORRECT - Compound filtering
    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId AND t.id = :id")
    Optional<Transaction> findByIdAndUserId(
        @Param("id") Long id, 
        @Param("userId") Long userId
    );
    
    // ✅ CORRECT - Aggregation with userId filter
    @Query("SELECT SUM(t.amount) FROM Transaction t " +
           "WHERE t.userId = :userId AND t.transactionDate BETWEEN :start AND :end")
    BigDecimal sumByUserIdAndDateRange(
        @Param("userId") Long userId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end
    );
}
```

**Layer 2: Service Level (Business Logic)**
```java
@Service
public class TransactionService {
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    public Transaction getById(Long userId, Long transactionId) {
        return transactionRepository.findByIdAndUserId(transactionId, userId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Transaction not found or does not belong to user"
            ));
    }
    
    public Transaction create(Long userId, TransactionDTO dto) {
        // Validate category belongs to user or is default
        validateCategoryAccess(userId, dto.getCategoryId());
        
        Transaction transaction = new Transaction();
        transaction.setUserId(userId); // ✅ Always set from JWT, never from request
        transaction.setAmount(dto.getAmount());
        transaction.setCategoryId(dto.getCategoryId());
        transaction.setMerchantName(dto.getMerchantName());
        transaction.setTransactionDate(dto.getTransactionDate());
        
        return transactionRepository.save(transaction);
    }
    
    public void delete(Long userId, Long transactionId) {
        Transaction transaction = getById(userId, transactionId);
        transactionRepository.delete(transaction);
    }
}
```

**Layer 3: Controller Level (Extract userId from JWT)**
```java
@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {
    
    @Autowired
    private TransactionService transactionService;
    
    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // Extract userId from authenticated user (JWT)
        Long userId = getUserIdFromUserDetails(userDetails);
        
        Transaction transaction = transactionService.getById(userId, id);
        return ResponseEntity.ok(toResponse(transaction));
    }
    
    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody CreateTransactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = getUserIdFromUserDetails(userDetails);
        
        // ❌ NEVER trust userId from request body
        // ✅ ALWAYS use userId from JWT token
        
        Transaction transaction = transactionService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(transaction));
    }
    
    private Long getUserIdFromUserDetails(UserDetails userDetails) {
        // UserDetails implementation includes userId
        return ((CustomUserDetails) userDetails).getUserId();
    }
}
```

#### Security Test Cases

**Test 1: User Cannot Access Another User's Transaction**
```java
@Test
void testUserCannotAccessOtherUsersTransaction() {
    // User A creates transaction
    Long userAId = 1L;
    Transaction transaction = createTransaction(userAId, 100.0);
    
    // User B tries to access User A's transaction
    Long userBId = 2L;
    
    assertThrows(ResourceNotFoundException.class, () -> {
        transactionService.getById(userBId, transaction.getId());
    });
}
```

**Test 2: User Cannot Modify Another User's Data**
```java
@Test
void testUserCannotUpdateOtherUsersTransaction() {
    Long userAId = 1L;
    Transaction transaction = createTransaction(userAId, 100.0);
    
    Long userBId = 2L;
    TransactionDTO updateDto = new TransactionDTO();
    updateDto.setAmount(new BigDecimal("200.00"));
    
    assertThrows(ResourceNotFoundException.class, () -> {
        transactionService.update(userBId, transaction.getId(), updateDto);
    });
}
```

---

## Password Security

### BCrypt Hashing

**Why BCrypt?**
- ✅ Adaptive cost factor (resistant to brute force as hardware improves)
- ✅ Built-in salt (prevents rainbow table attacks)
- ✅ Slow by design (makes brute force impractical)
- ✅ Industry standard (OWASP recommended)

**Configuration:**
```java
@Configuration
public class SecurityConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        // Cost factor 12 = 2^12 = 4096 iterations
        // Takes ~250ms to hash (acceptable UX, secure against brute force)
        return new BCryptPasswordEncoder(12);
    }
}
```

**Cost Factor Analysis:**

| Cost | Iterations | Hash Time | Annual Increase |
|------|------------|-----------|-----------------|
| 10 | 1,024 | ~65ms | Too fast |
| 11 | 2,048 | ~130ms | Minimum acceptable |
| **12** | **4,096** | **~250ms** | **✅ Recommended** |
| 13 | 8,192 | ~500ms | Overkill for web apps |
| 14 | 16,384 | ~1s | Too slow for UX |

**Usage:**
```java
@Service
public class UserService {
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private UserRepository userRepository;
    
    public User register(RegisterRequest request) {
        // Validate email not taken
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already registered");
        }
        
        // Hash password (BCrypt automatically generates salt)
        String passwordHash = passwordEncoder.encode(request.getPassword());
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordHash); // ✅ Store hash, not plain password
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        
        return userRepository.save(user);
    }
    
    public boolean validatePassword(String rawPassword, String passwordHash) {
        // BCrypt handles salt extraction and comparison
        return passwordEncoder.matches(rawPassword, passwordHash);
    }
}
```

### Password Policy

**Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Optional: Special characters (not enforced in MVP)

**Validation (Bean Validation):**
```java
@Data
public class RegisterRequest {
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
        message = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    private String password;
}
```

### Password Reset Security

**Token Generation:**
```java
public String generatePasswordResetToken(String email) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new UserNotFoundException("User not found"));
    
    // Generate cryptographically secure random token
    String token = UUID.randomUUID().toString();
    
    // Store token with expiration
    PasswordResetToken resetToken = new PasswordResetToken();
    resetToken.setUserId(user.getId());
    resetToken.setToken(token);
    resetToken.setExpiresAt(LocalDateTime.now().plusHours(1)); // 1-hour expiry
    
    passwordResetTokenRepository.save(resetToken);
    
    // Send email (implementation not shown)
    emailService.sendPasswordResetEmail(user.getEmail(), token);
    
    return token;
}
```

**Token Validation:**
```java
public void resetPassword(String token, String newPassword) {
    PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
        .orElseThrow(() -> new InvalidTokenException("Invalid or expired token"));
    
    // Check expiration
    if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
        throw new InvalidTokenException("Token has expired");
    }
    
    // Check if already used
    if (resetToken.getUsedAt() != null) {
        throw new InvalidTokenException("Token has already been used");
    }
    
    // Update password
    User user = userRepository.findById(resetToken.getUserId())
        .orElseThrow(() -> new UserNotFoundException("User not found"));
    
    user.setPasswordHash(passwordEncoder.encode(newPassword));
    userRepository.save(user);
    
    // Mark token as used
    resetToken.setUsedAt(LocalDateTime.now());
    passwordResetTokenRepository.save(resetToken);
    
    // Invalidate all refresh tokens for this user (force re-login)
    refreshTokenRepository.deleteByUserId(user.getId());
}
```

---

## Transport Security

### HTTPS/TLS Configuration

**Production Requirements:**
- ✅ TLS 1.3 (or minimum TLS 1.2)
- ✅ Strong cipher suites only
- ✅ HTTP Strict Transport Security (HSTS)
- ✅ Valid SSL certificate (Let's Encrypt or commercial)

**Spring Boot Configuration (application-prod.yml):**
```yaml
server:
  port: 8443
  ssl:
    enabled: true
    key-store: classpath:keystore.p12
    key-store-password: ${KEYSTORE_PASSWORD}
    key-store-type: PKCS12
    key-alias: easytrack
  http2:
    enabled: true
```

**Redirect HTTP to HTTPS:**
```java
@Configuration
public class HttpsConfig {
    
    @Bean
    public ServletWebServerFactory servletContainer() {
        TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory() {
            @Override
            protected void postProcessContext(Context context) {
                SecurityConstraint securityConstraint = new SecurityConstraint();
                securityConstraint.setUserConstraint("CONFIDENTIAL");
                SecurityCollection collection = new SecurityCollection();
                collection.addPattern("/*");
                securityConstraint.addCollection(collection);
                context.addConstraint(securityConstraint);
            }
        };
        tomcat.addAdditionalTomcatConnectors(redirectConnector());
        return tomcat;
    }
    
    private Connector redirectConnector() {
        Connector connector = new Connector("org.apache.coyote.http11.Http11NioProtocol");
        connector.setScheme("http");
        connector.setPort(8080);
        connector.setSecure(false);
        connector.setRedirectPort(8443);
        return connector;
    }
}
```

---

## Input Validation & Sanitization

### Bean Validation (JSR-380)

**Controller-Level Validation:**
```java
@RestController
@RequestMapping("/api/v1/transactions")
@Validated
public class TransactionController {
    
    @PostMapping
    public ResponseEntity<TransactionResponse> create(
            @Valid @RequestBody CreateTransactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // If validation fails, Spring automatically returns 400 Bad Request
        // with detailed error messages
        
        Long userId = getUserIdFromUserDetails(userDetails);
        Transaction transaction = transactionService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(transaction));
    }
}
```

**DTO Validation:**
```java
@Data
public class CreateTransactionRequest {
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Amount must have maximum 2 decimal places")
    private BigDecimal amount;
    
    @NotNull(message = "Category ID is required")
    @Positive(message = "Category ID must be positive")
    private Long categoryId;
    
    @Size(max = 255, message = "Merchant name cannot exceed 255 characters")
    private String merchantName;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
    
    @NotNull(message = "Transaction date is required")
    @PastOrPresent(message = "Transaction date cannot be in the future")
    private LocalDate transactionDate;
}
```

### Custom Validation

**Email Uniqueness Validator:**
```java
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = UniqueEmailValidator.class)
public @interface UniqueEmail {
    String message() default "Email already exists";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class UniqueEmailValidator implements ConstraintValidator<UniqueEmail, String> {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        return email != null && !userRepository.existsByEmail(email);
    }
}

// Usage
@Data
public class RegisterRequest {
    @NotBlank
    @Email
    @UniqueEmail
    private String email;
}
```

---

## SQL Injection Prevention

### JPA Parameterized Queries

**✅ SAFE - Parameterized Query:**
```java
@Query("SELECT t FROM Transaction t WHERE t.userId = :userId AND t.merchantName LIKE %:keyword%")
List<Transaction> searchByMerchant(@Param("userId") Long userId, @Param("keyword") String keyword);
```

**❌ UNSAFE - String Concatenation (NEVER DO THIS):**
```java
// DON'T DO THIS - Vulnerable to SQL injection
@Query(value = "SELECT * FROM transactions WHERE user_id = " + userId, nativeQuery = true)
List<Transaction> unsafeQuery(Long userId);
```

### Query Methods (Spring Data JPA)

**✅ SAFE - Method Query Derivation:**
```java
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // Spring Data JPA auto-generates safe parameterized query
    List<Transaction> findByUserIdAndTransactionDateBetween(
        Long userId, LocalDate startDate, LocalDate endDate
    );
}
```

---

## XSS & CSRF Protection

### XSS (Cross-Site Scripting) Protection

**Angular Auto-Sanitization:**

Angular automatically sanitizes all values before displaying them in the DOM.
```typescript
// Angular template - SAFE
<p>{{ transaction.merchantName }}</p>
// Even if merchantName contains <script>alert('XSS')</script>,
// Angular escapes it to &lt;script&gt;alert('XSS')&lt;/script&gt;
```

**Backend - No HTML in Responses:**
```java
// API returns plain text/JSON, never HTML
{
  "merchantName": "Starbucks",  // ✅ Plain text
  "description": "Coffee"       // ✅ No HTML allowed
}
```

### CSRF (Cross-Site Request Forgery) Protection

**Not Needed for Stateless JWT API:**

- ✅ No cookies used for authentication (JWT in Authorization header)
- ✅ Browsers don't auto-send Authorization headers
- ✅ CORS prevents unauthorized domains from making requests

**If Using Cookies (e.g., for refresh tokens):**
```java
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .csrf()
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .and()
            // ...
    }
}
```

---

## Rate Limiting

### Implementation Strategy

**Bucket4j Rate Limiting:**
```xml
<dependency>
    <groupId>com.github.vladimir-bukhtoyarov</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>7.6.0</version>
</dependency>
```

**Rate Limit Filter:**
```java
@Component
public class RateLimitFilter extends OncePerRequestFilter {
    
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String key = getClientKey(request);
        Bucket bucket = resolveBucket(key, request.getRequestURI());
        
        if (bucket.tryConsume(1)) {
            // Add rate limit headers
            response.setHeader("X-RateLimit-Remaining", String.valueOf(bucket.getAvailableTokens()));
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(429); // Too Many Requests
            response.setHeader("X-RateLimit-Retry-After-Seconds", "60");
            response.getWriter().write("{\"error\":\"Rate limit exceeded\"}");
        }
    }
    
    private Bucket resolveBucket(String key, String uri) {
        return cache.computeIfAbsent(key, k -> createBucket(uri));
    }
    
    private Bucket createBucket(String uri) {
        Bandwidth limit;
        
        if (uri.contains("/auth/login") || uri.contains("/auth/register")) {
            // Strict limit for auth endpoints
            limit = Bandwidth.simple(5, Duration.ofMinutes(15));
        } else {
            // General API limit
            limit = Bandwidth.simple(100, Duration.ofMinutes(1));
        }
        
        return Bucket.builder()
            .addLimit(limit)
            .build();
    }
    
    private String getClientKey(HttpServletRequest request) {
        // Use IP address as key (in production, consider user ID if authenticated)
        return request.getRemoteAddr();
    }
}
```

### Rate Limits

| Endpoint Pattern | Limit | Window |
|-----------------|-------|--------|
| `/api/v1/auth/login` | 5 requests | 15 minutes |
| `/api/v1/auth/register` | 3 requests | 1 hour |
| `/api/v1/auth/forgot-password` | 3 requests | 1 hour |
| All other endpoints | 100 requests | 1 minute |

---

## Security Headers

### HTTP Security Headers
```java
@Configuration
public class SecurityHeadersConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.headers()
            // Prevent clickjacking
            .frameOptions().deny()
            
            // Force HTTPS
            .httpStrictTransportSecurity()
                .maxAgeInSeconds(31536000) // 1 year
                .includeSubDomains(true)
                .and()
            
            // Prevent MIME sniffing
            .contentTypeOptions().and()
            
            // XSS Protection (legacy, but doesn't hurt)
            .xssProtection()
                .xssProtectionEnabled(true)
                .block(true)
                .and()
            
            // Referrer Policy
            .referrerPolicy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
            .and()
            
            // Content Security Policy
            .contentSecurityPolicy("default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
        
        return http.build();
    }
}
```

**Response Headers:**
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-