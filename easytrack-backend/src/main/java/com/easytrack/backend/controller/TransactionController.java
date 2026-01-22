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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

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

    @PostMapping
    @Operation(summary = "Create a new transaction")
    public ResponseEntity<TransactionDTO> createTransaction(@Valid @RequestBody TransactionDTO transactionDTO) {
        User user = userService.getUserById(transactionDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", transactionDTO.getUserId()));
        Account account = accountService.getAccountById(transactionDTO.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", transactionDTO.getAccountId()));
        Category category = categoryService.getCategoryById(transactionDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", transactionDTO.getCategoryId()));

        Transaction transaction = transactionMapper.toEntity(transactionDTO, user, account, category);
        Transaction createdTransaction = transactionService.createTransaction(transaction);
        return new ResponseEntity<>(transactionMapper.toDTO(createdTransaction), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get transaction by ID")
    public ResponseEntity<TransactionDTO> getTransactionById(@PathVariable Long id) {
        return transactionService.getTransactionById(id)
                .map(transaction -> ResponseEntity.ok(transactionMapper.toDTO(transaction)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "Get all transactions")
    public ResponseEntity<List<TransactionDTO>> getAllTransactions() {
        List<TransactionDTO> transactions = transactionService.getAllTransactions().stream()
                .map(transactionMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get transactions by user ID")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByUserId(@PathVariable Long userId) {
        List<TransactionDTO> transactions = transactionService.getTransactionsByUserId(userId).stream()
                .map(transactionMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/user/{userId}/type/{type}")
    @Operation(summary = "Get transactions by user ID and type")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByUserIdAndType(
            @PathVariable Long userId,
            @PathVariable Transaction.TransactionType type) {
        List<TransactionDTO> transactions = transactionService.getTransactionsByUserIdAndType(userId, type).stream()
                .map(transactionMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/user/{userId}/account/{accountId}")
    @Operation(summary = "Get transactions by account ID")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByAccountId(
            @PathVariable Long userId,
            @PathVariable Long accountId) {
        List<TransactionDTO> transactions = transactionService.getTransactionsByAccountId(userId, accountId).stream()
                .map(transactionMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/user/{userId}/category/{categoryId}")
    @Operation(summary = "Get transactions by category ID")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByCategoryId(
            @PathVariable Long userId,
            @PathVariable Long categoryId) {
        List<TransactionDTO> transactions = transactionService.getTransactionsByCategoryId(userId, categoryId).stream()
                .map(transactionMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/user/{userId}/date-range")
    @Operation(summary = "Get transactions by date range")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<TransactionDTO> transactions = transactionService.getTransactionsByDateRange(userId, startDate, endDate).stream()
                .map(transactionMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/user/{userId}/summary")
    @Operation(summary = "Get transaction summary for date range")
    public ResponseEntity<TransactionSummaryDTO> getTransactionSummary(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        BigDecimal income = transactionService.getTotalIncomeByDateRange(userId, startDate, endDate);
        BigDecimal expense = transactionService.getTotalExpenseByDateRange(userId, startDate, endDate);
        BigDecimal net = transactionService.getNetIncomeByDateRange(userId, startDate, endDate);

        TransactionSummaryDTO summary = new TransactionSummaryDTO(income, expense, net);
        return ResponseEntity.ok(summary);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update transaction")
    public ResponseEntity<TransactionDTO> updateTransaction(@PathVariable Long id, @Valid @RequestBody TransactionDTO transactionDTO) {
        Transaction transaction = transactionService.getTransactionById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));
        Account account = accountService.getAccountById(transactionDTO.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", transactionDTO.getAccountId()));
        Category category = categoryService.getCategoryById(transactionDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", transactionDTO.getCategoryId()));

        transactionMapper.updateEntityFromDTO(transactionDTO, transaction, account, category);
        Transaction updatedTransaction = transactionService.updateTransaction(id, transaction);
        return ResponseEntity.ok(transactionMapper.toDTO(updatedTransaction));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete transaction")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}