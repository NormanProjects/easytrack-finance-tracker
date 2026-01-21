package com.easytrack.backend.controller;

import com.easytrack.backend.entity.Transaction;
import com.easytrack.backend.service.TransactionService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transaction Management", description = "APIs for managing financial transactions")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    @Operation(summary = "Create a new transaction")
    public ResponseEntity<Transaction> createTransaction(@Valid @RequestBody Transaction transaction) {
        Transaction createdTransaction = transactionService.createTransaction(transaction);
        return new ResponseEntity<>(createdTransaction, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get transaction by ID")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable Long id) {
        return transactionService.getTransactionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "Get all transactions")
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get transactions by user ID")
    public ResponseEntity<List<Transaction>> getTransactionsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(transactionService.getTransactionsByUserId(userId));
    }

    @GetMapping("/user/{userId}/type/{type}")
    @Operation(summary = "Get transactions by user ID and type")
    public ResponseEntity<List<Transaction>> getTransactionsByUserIdAndType(
            @PathVariable Long userId,
            @PathVariable Transaction.TransactionType type) {
        return ResponseEntity.ok(transactionService.getTransactionsByUserIdAndType(userId, type));
    }

    @GetMapping("/user/{userId}/account/{accountId}")
    @Operation(summary = "Get transactions by account ID")
    public ResponseEntity<List<Transaction>> getTransactionsByAccountId(
            @PathVariable Long userId,
            @PathVariable Long accountId) {
        return ResponseEntity.ok(transactionService.getTransactionsByAccountId(userId, accountId));
    }

    @GetMapping("/user/{userId}/category/{categoryId}")
    @Operation(summary = "Get transactions by category ID")
    public ResponseEntity<List<Transaction>> getTransactionsByCategoryId(
            @PathVariable Long userId,
            @PathVariable Long categoryId) {
        return ResponseEntity.ok(transactionService.getTransactionsByCategoryId(userId, categoryId));
    }

    @GetMapping("/user/{userId}/date-range")
    @Operation(summary = "Get transactions by date range")
    public ResponseEntity<List<Transaction>> getTransactionsByDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(transactionService.getTransactionsByDateRange(userId, startDate, endDate));
    }

    @GetMapping("/user/{userId}/summary")
    @Operation(summary = "Get transaction summary for date range")
    public ResponseEntity<Map<String, BigDecimal>> getTransactionSummary(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        BigDecimal income = transactionService.getTotalIncomeByDateRange(userId, startDate, endDate);
        BigDecimal expense = transactionService.getTotalExpenseByDateRange(userId, startDate, endDate);
        BigDecimal net = transactionService.getNetIncomeByDateRange(userId, startDate, endDate);

        return ResponseEntity.ok(Map.of(
                "income", income,
                "expense", expense,
                "net", net
        ));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update transaction")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable Long id, @Valid @RequestBody Transaction transaction) {
        Transaction updatedTransaction = transactionService.updateTransaction(id, transaction);
        return ResponseEntity.ok(updatedTransaction);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete transaction")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}