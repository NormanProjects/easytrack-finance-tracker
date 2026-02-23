package com.easytrack.backend.controller;

import com.easytrack.backend.dto.BudgetDTO;
import com.easytrack.backend.entity.Budget;
import com.easytrack.backend.entity.Category;
import com.easytrack.backend.entity.User;
import com.easytrack.backend.mapper.BudgetMapper;
import com.easytrack.backend.repository.CategoryRepository;
import com.easytrack.backend.repository.UserRepository;
import com.easytrack.backend.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@Tag(name = "Budget Management", description = "APIs for managing budgets")
public class BudgetController {

    private final BudgetService budgetService;
    private final BudgetMapper budgetMapper;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    @PostMapping
    @Operation(summary = "Create a new budget")
    public ResponseEntity<BudgetDTO> createBudget(@Valid @RequestBody BudgetDTO budgetDTO) {
        String userEmail = getAuthenticatedUserEmail();
        log.info(" Create budget requested by user: {}", userEmail);

        User user = getUserByEmail(userEmail);
        Category category = categoryRepository.findById(budgetDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Budget budget = budgetMapper.toEntity(budgetDTO, user, category);
        Budget createdBudget = budgetService.createBudget(budget);

        log.info(" Budget created: {}", createdBudget.getId());
        return new ResponseEntity<>(budgetMapper.toDTO(createdBudget), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get budget by ID")
    public ResponseEntity<BudgetDTO> getBudgetById(@PathVariable Long id) {
        String userEmail = getAuthenticatedUserEmail();
        log.info(" Get budget by ID: {} requested by: {}", id, userEmail);

        return budgetService.getBudgetById(id)
                .map(budgetMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "Get all budgets for authenticated user")
    public ResponseEntity<List<BudgetDTO>> getAllBudgets() {
        String userEmail = getAuthenticatedUserEmail();
        log.info(" Get all budgets requested by: {}", userEmail);

        User user = getUserByEmail(userEmail);
        List<BudgetDTO> budgets = budgetService.getBudgetsByUserId(user.getId())
                .stream()
                .map(budgetMapper::toDTO)
                .collect(Collectors.toList());

        log.info(" Found {} budgets", budgets.size());
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active budgets for authenticated user")
    public ResponseEntity<List<BudgetDTO>> getActiveBudgets() {
        String userEmail = getAuthenticatedUserEmail();
        log.info(" Get active budgets requested by: {}", userEmail);

        User user = getUserByEmail(userEmail);
        List<BudgetDTO> budgets = budgetService.getActiveBudgetsByUserId(user.getId())
                .stream()
                .map(budgetMapper::toDTO)
                .collect(Collectors.toList());

        log.info(" Found {} active budgets", budgets.size());
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/current")
    @Operation(summary = "Get current budgets for authenticated user")
    public ResponseEntity<List<BudgetDTO>> getCurrentBudgets(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        String userEmail = getAuthenticatedUserEmail();
        LocalDate targetDate = date != null ? date : LocalDate.now();
        log.info("Get current budgets for date: {} requested by: {}", targetDate, userEmail);

        User user = getUserByEmail(userEmail);
        List<BudgetDTO> budgets = budgetService.getCurrentBudgets(user.getId(), targetDate)
                .stream()
                .map(budgetMapper::toDTO)
                .collect(Collectors.toList());

        log.info(" Found {} current budgets", budgets.size());
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/{id}/progress")
    @Operation(summary = "Get budget progress percentage")
    public ResponseEntity<BigDecimal> getBudgetProgress(@PathVariable Long id) {
        String userEmail = getAuthenticatedUserEmail();
        log.info(" Get budget progress for ID: {} requested by: {}", id, userEmail);

        BigDecimal progress = budgetService.getBudgetProgress(id);
        return ResponseEntity.ok(progress);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh all budget spent amounts for authenticated user")
    public ResponseEntity<Void> refreshAllBudgetSpent() {
        String userEmail = getAuthenticatedUserEmail();
        log.info("Refresh all budgets requested by: {}", userEmail);

        User user = getUserByEmail(userEmail);
        budgetService.refreshAllBudgetSpent(user.getId());

        log.info(" Budgets refreshed successfully");
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update budget")
    public ResponseEntity<BudgetDTO> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetDTO budgetDTO) {
        String userEmail = getAuthenticatedUserEmail();
        log.info(" Update budget ID: {} requested by: {}", id, userEmail);

        Budget existingBudget = budgetService.getBudgetById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        Category category = null;
        if (budgetDTO.getCategoryId() != null) {
            category = categoryRepository.findById(budgetDTO.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
        }

        budgetMapper.updateEntityFromDTO(budgetDTO, existingBudget, category);
        Budget updatedBudget = budgetService.updateBudget(id, existingBudget);

        log.info(" Budget updated: {}", id);
        return ResponseEntity.ok(budgetMapper.toDTO(updatedBudget));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete budget")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        String userEmail = getAuthenticatedUserEmail();
        log.info(" Delete budget ID: {} requested by: {}", id, userEmail);

        budgetService.deleteBudget(id);

        log.info(" Budget deleted: {}", id);
        return ResponseEntity.noContent().build();
    }

    // Helper methods
    private String getAuthenticatedUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            log.error(" No authentication found");
            throw new RuntimeException("User not authenticated");
        }
        return authentication.getName();
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }
}