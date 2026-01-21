package com.easytrack.backend.controller;

import com.easytrack.backend.entity.Budget;
import com.easytrack.backend.service.BudgetService;
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

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@Tag(name = "Budget Management", description = "APIs for managing budgets")
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    @Operation(summary = "Create a new budget")
    public ResponseEntity<Budget> createBudget(@Valid @RequestBody Budget budget) {
        Budget createdBudget = budgetService.createBudget(budget);
        return new ResponseEntity<>(createdBudget, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get budget by ID")
    public ResponseEntity<Budget> getBudgetById(@PathVariable Long id) {
        return budgetService.getBudgetById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "Get all budgets")
    public ResponseEntity<List<Budget>> getAllBudgets() {
        return ResponseEntity.ok(budgetService.getAllBudgets());
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get budgets by user ID")
    public ResponseEntity<List<Budget>> getBudgetsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(budgetService.getBudgetsByUserId(userId));
    }

    @GetMapping("/user/{userId}/active")
    @Operation(summary = "Get active budgets by user ID")
    public ResponseEntity<List<Budget>> getActiveBudgetsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(budgetService.getActiveBudgetsByUserId(userId));
    }

    @GetMapping("/user/{userId}/current")
    @Operation(summary = "Get current budgets for a specific date")
    public ResponseEntity<List<Budget>> getCurrentBudgets(
            @PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(budgetService.getCurrentBudgets(userId, targetDate));
    }

    @GetMapping("/{id}/progress")
    @Operation(summary = "Get budget progress percentage")
    public ResponseEntity<BigDecimal> getBudgetProgress(@PathVariable Long id) {
        return ResponseEntity.ok(budgetService.getBudgetProgress(id));
    }

    @PostMapping("/user/{userId}/refresh")
    @Operation(summary = "Refresh all budget spent amounts")
    public ResponseEntity<Void> refreshAllBudgetSpent(@PathVariable Long userId) {
        budgetService.refreshAllBudgetSpent(userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update budget")
    public ResponseEntity<Budget> updateBudget(@PathVariable Long id, @Valid @RequestBody Budget budget) {
        Budget updatedBudget = budgetService.updateBudget(id, budget);
        return ResponseEntity.ok(updatedBudget);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete budget")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}