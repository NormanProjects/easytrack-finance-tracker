package com.easytrack.backend.controller;

import com.easytrack.backend.entity.RecurringTransaction;
import com.easytrack.backend.service.RecurringTransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/recurring-transactions")
@RequiredArgsConstructor
@Tag(name = "Recurring Transaction Management", description = "APIs for managing recurring transactions")
public class RecurringTransactionController {

    private final RecurringTransactionService recurringTransactionService;

    @PostMapping
    @Operation(summary = "Create a new recurring transaction")
    public ResponseEntity<RecurringTransaction> createRecurringTransaction(
            @Valid @RequestBody RecurringTransaction recurringTransaction) {
        RecurringTransaction created = recurringTransactionService.createRecurringTransaction(recurringTransaction);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get recurring transaction by ID")
    public ResponseEntity<RecurringTransaction> getRecurringTransactionById(@PathVariable Long id) {
        return recurringTransactionService.getRecurringTransactionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "Get all recurring transactions")
    public ResponseEntity<List<RecurringTransaction>> getAllRecurringTransactions() {
        return ResponseEntity.ok(recurringTransactionService.getAllRecurringTransactions());
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get recurring transactions by user ID")
    public ResponseEntity<List<RecurringTransaction>> getRecurringTransactionsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(recurringTransactionService.getRecurringTransactionsByUserId(userId));
    }

    @GetMapping("/user/{userId}/active")
    @Operation(summary = "Get active recurring transactions by user ID")
    public ResponseEntity<List<RecurringTransaction>> getActiveRecurringTransactionsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(recurringTransactionService.getActiveRecurringTransactionsByUserId(userId));
    }

    @PostMapping("/process")
    @Operation(summary = "Process all due recurring transactions")
    public ResponseEntity<Void> processRecurringTransactions() {
        recurringTransactionService.processRecurringTransactions();
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update recurring transaction")
    public ResponseEntity<RecurringTransaction> updateRecurringTransaction(
            @PathVariable Long id,
            @Valid @RequestBody RecurringTransaction recurringTransaction) {
        RecurringTransaction updated = recurringTransactionService.updateRecurringTransaction(id, recurringTransaction);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete recurring transaction")
    public ResponseEntity<Void> deleteRecurringTransaction(@PathVariable Long id) {
        recurringTransactionService.deleteRecurringTransaction(id);
        return ResponseEntity.noContent().build();
    }
}