package com.easytrack.backend.controller;

import com.easytrack.backend.dto.RecurringTransactionDTO;
import com.easytrack.backend.entity.Account;
import com.easytrack.backend.entity.Category;
import com.easytrack.backend.entity.RecurringTransaction;
import com.easytrack.backend.entity.User;
import com.easytrack.backend.mapper.RecurringTransactionMapper;
import com.easytrack.backend.service.AccountService;
import com.easytrack.backend.service.CategoryService;
import com.easytrack.backend.service.RecurringTransactionService;
import com.easytrack.backend.util.SecurityUtil;
import com.easytrack.backend.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recurring-transactions")
@RequiredArgsConstructor
@Tag(name = "Recurring Transaction Management", description = "APIs for managing recurring transactions")
public class RecurringTransactionController {

    private final RecurringTransactionService recurringTransactionService;
    private final AccountService accountService;
    private final CategoryService categoryService;
    private final RecurringTransactionMapper recurringTransactionMapper;
    private final SecurityUtil securityUtil;

    @PostMapping
    @Operation(summary = "Create a new recurring transaction")
    public ResponseEntity<RecurringTransactionDTO> createRecurringTransaction(
            @Valid @RequestBody RecurringTransactionDTO recurringTransactionDTO) {
        User user = securityUtil.getAuthenticatedUser();

        Account account = accountService.getAccountById(recurringTransactionDTO.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", recurringTransactionDTO.getAccountId()));
        Category category = categoryService.getCategoryById(recurringTransactionDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", recurringTransactionDTO.getCategoryId()));

        RecurringTransaction recurringTransaction = recurringTransactionMapper.toEntity(recurringTransactionDTO, user, account, category);
        RecurringTransaction created = recurringTransactionService.createRecurringTransaction(recurringTransaction);
        return new ResponseEntity<>(recurringTransactionMapper.toDTO(created), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get recurring transaction by ID")
    public ResponseEntity<RecurringTransactionDTO> getRecurringTransactionById(@PathVariable Long id) {
        Long userId = securityUtil.getAuthenticatedUserId();

        return recurringTransactionService.getRecurringTransactionById(id)
                .filter(rt -> rt.getUser().getId().equals(userId))
                .map(rt -> ResponseEntity.ok(recurringTransactionMapper.toDTO(rt)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "Get all recurring transactions for authenticated user")
    public ResponseEntity<List<RecurringTransactionDTO>> getAllRecurringTransactions() {
        Long userId = securityUtil.getAuthenticatedUserId();

        List<RecurringTransactionDTO> recurringTransactions = recurringTransactionService.getRecurringTransactionsByUserId(userId).stream()
                .map(recurringTransactionMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(recurringTransactions);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active recurring transactions for authenticated user")
    public ResponseEntity<List<RecurringTransactionDTO>> getActiveRecurringTransactions() {
        Long userId = securityUtil.getAuthenticatedUserId();

        List<RecurringTransactionDTO> recurringTransactions = recurringTransactionService.getActiveRecurringTransactionsByUserId(userId).stream()
                .map(recurringTransactionMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(recurringTransactions);
    }

    @PostMapping("/process")
    @Operation(summary = "Process all due recurring transactions for authenticated user")
    public ResponseEntity<Void> processRecurringTransactions() {
        // This endpoint processes all recurring transactions system-wide
        // In production, this should be called by a scheduled job, not exposed as an API
        recurringTransactionService.processRecurringTransactions();
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update recurring transaction")
    public ResponseEntity<RecurringTransactionDTO> updateRecurringTransaction(
            @PathVariable Long id,
            @Valid @RequestBody RecurringTransactionDTO recurringTransactionDTO) {
        Long userId = securityUtil.getAuthenticatedUserId();

        RecurringTransaction recurringTransaction = recurringTransactionService.getRecurringTransactionById(id)
                .filter(rt -> rt.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Recurring Transaction", "id", id));

        Account account = accountService.getAccountById(recurringTransactionDTO.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", recurringTransactionDTO.getAccountId()));
        Category category = categoryService.getCategoryById(recurringTransactionDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", recurringTransactionDTO.getCategoryId()));

        recurringTransactionMapper.updateEntityFromDTO(recurringTransactionDTO, recurringTransaction, account, category);
        RecurringTransaction updated = recurringTransactionService.updateRecurringTransaction(id, recurringTransaction);
        return ResponseEntity.ok(recurringTransactionMapper.toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete recurring transaction")
    public ResponseEntity<Void> deleteRecurringTransaction(@PathVariable Long id) {
        Long userId = securityUtil.getAuthenticatedUserId();

        recurringTransactionService.getRecurringTransactionById(id)
                .filter(rt -> rt.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Recurring Transaction", "id", id));

        recurringTransactionService.deleteRecurringTransaction(id);
        return ResponseEntity.noContent().build();
    }
}