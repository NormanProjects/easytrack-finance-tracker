package com.easytrack.backend.controller;

import com.easytrack.backend.dto.TransactionDTO;
import com.easytrack.backend.dto.TransactionSummaryDTO;
import com.easytrack.backend.entity.Account;
import com.easytrack.backend.entity.Category;
import com.easytrack.backend.entity.Transaction;
import com.easytrack.backend.entity.User;
import com.easytrack.backend.mapper.TransactionMapper;
import com.easytrack.backend.service.AccountService;
import com.easytrack.backend.service.CategoryService;
import com.easytrack.backend.service.TransactionService;
import com.easytrack.backend.service.UserService;
import com.easytrack.backend.exception.ResourceNotFoundException;
import com.easytrack.backend.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transaction Management", description = "APIs for managing financial transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final UserService userService;
    private final AccountService accountService;
    private final CategoryService categoryService;
    private final TransactionMapper transactionMapper;
    private final SecurityUtil securityUtil;


    @GetMapping("/categories")
    @Operation(summary = "Get all available transaction categories")
    public ResponseEntity<List<String>> getCategories() {
        log.info("Get transaction categories requested");
        try {
            // Return defaults for mock users or empty DB
            if (isMockUser()) {
                log.info("Mock user - returning default categories");
                return ResponseEntity.ok(getDefaultCategories());
            }

            List<String> categories = categoryService.getAllCategories().stream()
                    .map(Category::getName)
                    .toList();  // replaces collect(toList())

            if (categories.isEmpty()) {
                return ResponseEntity.ok(getDefaultCategories());
            }

            log.info("Found {} categories", categories.size());
            return ResponseEntity.ok(categories);

        } catch (Exception e) {
            log.error("Error fetching categories: {}", e.getMessage());
            return ResponseEntity.ok(getDefaultCategories());
        }
    }

    @GetMapping
    @Operation(summary = "Get all transactions for authenticated user")
    public ResponseEntity<Map<String, Object>> getAllTransactions(
            @RequestParam(required = false) String dateRange,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("Get transactions requested (page={}, size={})", page, size);

        try {
            if (isMockUser()) {
                log.info("Mock user - returning empty transactions");
                return ResponseEntity.ok(buildPageResponse(new ArrayList<>(), 0, 1, page));
            }

            Long userId = securityUtil.getAuthenticatedUserId();
            List<TransactionDTO> transactionDtos = transactionService.getTransactionsByUserId(userId)
                    .stream()
                    .map(transactionMapper::toDTO)
                    .toList();  // replaces collect(toList())

            int totalCount = transactionDtos.size();
            int totalPages = (int) Math.ceil((double) totalCount / size);
            int start = (page - 1) * size;
            int end = Math.min(start + size, totalCount);
            List<TransactionDTO> pageContent = start < totalCount
                    ? transactionDtos.subList(start, end)
                    : new ArrayList<>();

            log.info("Found {} transactions", totalCount);
            return ResponseEntity.ok(buildPageResponse(pageContent, totalCount, totalPages, page));

        } catch (Exception e) {
            log.error("Error fetching transactions: {}", e.getMessage());
            return ResponseEntity.ok(buildPageResponse(new ArrayList<>(), 0, 1, page));
        }
    }

    @GetMapping("/summary")
    @Operation(summary = "Get transaction summary for authenticated user")
    public ResponseEntity<TransactionSummaryDTO> getTransactionSummary(
            @RequestParam(required = false) String dateRange) {  // accepted, defaults to current month

        log.info("Get transaction summary requested");
        try {
            if (isMockUser()) {
                return ResponseEntity.ok(emptyTransactionSummary());
            }

            Long userId = securityUtil.getAuthenticatedUserId();
            LocalDate endDate   = LocalDate.now();
            LocalDate startDate = endDate.withDayOfMonth(1);

            BigDecimal income  = transactionService.getTotalIncomeByDateRange(userId, startDate, endDate);
            BigDecimal expense = transactionService.getTotalExpenseByDateRange(userId, startDate, endDate);
            BigDecimal net     = transactionService.getNetIncomeByDateRange(userId, startDate, endDate);

            return ResponseEntity.ok(new TransactionSummaryDTO(income, expense, net));

        } catch (Exception e) {
            log.error("Error fetching transaction summary: {}", e.getMessage());
            return ResponseEntity.ok(emptyTransactionSummary());
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get transaction by ID")
    public ResponseEntity<TransactionDTO> getTransactionById(@PathVariable Long id) {
        return transactionService.getTransactionById(id)
                .map(t -> ResponseEntity.ok(transactionMapper.toDTO(t)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a new transaction")
    public ResponseEntity<TransactionDTO> createTransaction(@Valid @RequestBody TransactionDTO transactionDTO) {
        try {
            if (isMockUser()) {
                log.info("Mock user - returning mock transaction");
                transactionDTO.setId(9999L);
                return ResponseEntity.status(HttpStatus.CREATED).body(transactionDTO);
            }

            User user = userService.getUserById(transactionDTO.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", transactionDTO.getUserId()));
            Account account = accountService.getAccountById(transactionDTO.getAccountId())
                    .orElseThrow(() -> new ResourceNotFoundException("Account", "id", transactionDTO.getAccountId()));
            Category category = categoryService.getCategoryById(transactionDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", transactionDTO.getCategoryId()));

            Transaction created = transactionService.createTransaction(
                    transactionMapper.toEntity(transactionDTO, user, account, category));
            return new ResponseEntity<>(transactionMapper.toDTO(created), HttpStatus.CREATED);

        } catch (Exception e) {
            log.error("Error creating transaction: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update transaction")
    public ResponseEntity<TransactionDTO> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionDTO transactionDTO) {
        try {
            if (isMockUser()) {
                transactionDTO.setId(id);
                return ResponseEntity.ok(transactionDTO);
            }

            Transaction transaction = transactionService.getTransactionById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));
            Account account = accountService.getAccountById(transactionDTO.getAccountId())
                    .orElseThrow(() -> new ResourceNotFoundException("Account", "id", transactionDTO.getAccountId()));
            Category category = categoryService.getCategoryById(transactionDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", transactionDTO.getCategoryId()));

            transactionMapper.updateEntityFromDTO(transactionDTO, transaction, account, category);
            return ResponseEntity.ok(transactionMapper.toDTO(
                    transactionService.updateTransaction(id, transaction)));

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating transaction {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete transaction")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        try {
            if (isMockUser()) {
                return ResponseEntity.noContent().build();
            }
            transactionService.deleteTransaction(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting transaction {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(transactionService.getTransactionsByUserId(userId)
                .stream().map(transactionMapper::toDTO).toList());
    }

    @GetMapping("/user/{userId}/type/{type}")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByUserIdAndType(
            @PathVariable Long userId, @PathVariable Transaction.TransactionType type) {
        return ResponseEntity.ok(transactionService.getTransactionsByUserIdAndType(userId, type)
                .stream().map(transactionMapper::toDTO).toList());
    }

    @GetMapping("/user/{userId}/account/{accountId}")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByAccountId(
            @PathVariable Long userId, @PathVariable Long accountId) {
        return ResponseEntity.ok(transactionService.getTransactionsByAccountId(userId, accountId)
                .stream().map(transactionMapper::toDTO).toList());
    }

    @GetMapping("/user/{userId}/category/{categoryId}")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByCategoryId(
            @PathVariable Long userId, @PathVariable Long categoryId) {
        return ResponseEntity.ok(transactionService.getTransactionsByCategoryId(userId, categoryId)
                .stream().map(transactionMapper::toDTO).toList());
    }

    @GetMapping("/user/{userId}/date-range")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(transactionService.getTransactionsByDateRange(userId, startDate, endDate)
                .stream().map(transactionMapper::toDTO).toList());
    }

    @GetMapping("/user/{userId}/summary")
    public ResponseEntity<TransactionSummaryDTO> getUserTransactionSummary(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(new TransactionSummaryDTO(
                transactionService.getTotalIncomeByDateRange(userId, startDate, endDate),
                transactionService.getTotalExpenseByDateRange(userId, startDate, endDate),
                transactionService.getNetIncomeByDateRange(userId, startDate, endDate)));
    }

    private boolean isMockUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth == null || "demo@test.com".equals(auth.getName());
    }

    private TransactionSummaryDTO emptyTransactionSummary() {
        return new TransactionSummaryDTO(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
    }

    private List<String> getDefaultCategories() {
        return List.of(
                "Food & Dining", "Transportation", "Shopping", "Entertainment",
                "Bills & Utilities", "Healthcare", "Education", "Housing",
                "Personal Care", "Savings", "Income", "Other");
    }

    private Map<String, Object> buildPageResponse(List<?> transactions, int totalCount, int totalPages, int currentPage) {
        return Map.of(
                "transactions", transactions,
                "totalCount",   totalCount,
                "totalPages",   totalPages,
                "currentPage",  currentPage);
    }
}