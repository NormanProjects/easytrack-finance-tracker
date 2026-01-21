package com.easytrack.backend.service;

import com.easytrack.backend.entity.Budget;
import com.easytrack.backend.repository.BudgetRepository;
import com.easytrack.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    public Budget createBudget(Budget budget) {
        // Check if budget already exists for this category and period
        Optional<Budget> existing = budgetRepository.findByUserIdAndCategoryIdAndStartDateAndEndDate(
                budget.getUser().getId(),
                budget.getCategory().getId(),
                budget.getStartDate(),
                budget.getEndDate()
        );

        if (existing.isPresent()) {
            throw new RuntimeException("Budget already exists for this category and period");
        }

        // Calculate spent amount
        updateBudgetSpent(budget);

        return budgetRepository.save(budget);
    }

    public Optional<Budget> getBudgetById(Long id) {
        return budgetRepository.findById(id);
    }

    public List<Budget> getAllBudgets() {
        return budgetRepository.findAll();
    }

    public List<Budget> getBudgetsByUserId(Long userId) {
        return budgetRepository.findByUserId(userId);
    }

    public List<Budget> getActiveBudgetsByUserId(Long userId) {
        return budgetRepository.findByUserIdAndIsActive(userId, true);
    }

    public List<Budget> getCurrentBudgets(Long userId, LocalDate date) {
        return budgetRepository.findByUserIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                userId, date, date);
    }

    public Budget updateBudget(Long id, Budget budgetDetails) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        budget.setCategory(budgetDetails.getCategory());
        budget.setAmount(budgetDetails.getAmount());
        budget.setPeriod(budgetDetails.getPeriod());
        budget.setStartDate(budgetDetails.getStartDate());
        budget.setEndDate(budgetDetails.getEndDate());
        budget.setIsActive(budgetDetails.getIsActive());

        // Recalculate spent amount
        updateBudgetSpent(budget);

        return budgetRepository.save(budget);
    }

    public void deleteBudget(Long id) {
        if (!budgetRepository.existsById(id)) {
            throw new RuntimeException("Budget not found");
        }
        budgetRepository.deleteById(id);
    }

    public void updateBudgetSpent(Budget budget) {
        BigDecimal spent = transactionRepository.sumByCategoryAndDateRange(
                budget.getUser().getId(),
                budget.getCategory().getId(),
                budget.getStartDate(),
                budget.getEndDate()
        );
        budget.setSpent(spent != null ? spent : BigDecimal.ZERO);
    }

    public void refreshAllBudgetSpent(Long userId) {
        List<Budget> budgets = getActiveBudgetsByUserId(userId);
        budgets.forEach(budget -> {
            updateBudgetSpent(budget);
            budgetRepository.save(budget);
        });
    }

    public BigDecimal getBudgetProgress(Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (budget.getAmount().compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return budget.getSpent()
                .divide(budget.getAmount(), 2, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }
}
