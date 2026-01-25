package com.easytrack.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {

    // Financial Overview
    private BigDecimal totalBalance;
    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpense;
    private BigDecimal netIncome;

    // Budget Information
    private BudgetSummary budgetSummary;

    // Spending Trends
    private SpendingComparison spendingComparison;

    // Quick Stats
    private QuickStats quickStats;

    // Recent Transactions
    private List<TransactionDTO> recentTransactions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetSummary {
        private BigDecimal totalBudget;
        private BigDecimal totalSpent;
        private BigDecimal remaining;
        private BigDecimal percentageUsed;
        private BigDecimal safeToSpendDaily; // Left to spend divided by days remaining in month
        private int daysRemainingInMonth;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SpendingComparison {
        private BigDecimal currentMonthSpending;
        private BigDecimal previousMonthSpending;
        private BigDecimal difference;
        private BigDecimal percentageChange;
        private String trend; // "UP", "DOWN", "STABLE"
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuickStats {
        private int totalAccounts;
        private int activeAccounts;
        private int totalTransactions;
        private int monthlyTransactions;
        private LocalDate lastTransactionDate;
    }
}