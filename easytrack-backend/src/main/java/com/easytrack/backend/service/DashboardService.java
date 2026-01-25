package com.easytrack.backend.service;

import com.easytrack.backend.dto.DashboardSummaryDTO;
import com.easytrack.backend.dto.DashboardSummaryDTO.*;
import com.easytrack.backend.dto.TransactionDTO;
import com.easytrack.backend.entity.Budget;
import com.easytrack.backend.entity.Transaction;
import com.easytrack.backend.mapper.TransactionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final AccountService accountService;
    private final TransactionService transactionService;
    private final BudgetService budgetService;
    private final TransactionMapper transactionMapper;

    public DashboardSummaryDTO getDashboardSummary(Long userId) {
        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(today);
        LocalDate monthStart = currentMonth.atDay(1);
        LocalDate monthEnd = currentMonth.atEndOfMonth();

        YearMonth previousMonth = currentMonth.minusMonths(1);
        LocalDate prevMonthStart = previousMonth.atDay(1);
        LocalDate prevMonthEnd = previousMonth.atEndOfMonth();

        // Financial Overview
        BigDecimal totalBalance = accountService.getTotalBalance(userId);
        BigDecimal monthlyIncome = transactionService.getTotalIncomeByDateRange(userId, monthStart, monthEnd);
        BigDecimal monthlyExpense = transactionService.getTotalExpenseByDateRange(userId, monthStart, monthEnd);
        BigDecimal netIncome = monthlyIncome.subtract(monthlyExpense);

        // Budget Summary
        BudgetSummary budgetSummary = calculateBudgetSummary(userId, monthStart, monthEnd, today);

        // Spending Comparison
        SpendingComparison spendingComparison = calculateSpendingComparison(
                userId, monthStart, monthEnd, prevMonthStart, prevMonthEnd);

        // Quick Stats
        QuickStats quickStats = calculateQuickStats(userId, monthStart, monthEnd);

        // Recent Transactions (last 5)
        List<TransactionDTO> recentTransactions = transactionService.getTransactionsByUserId(userId)
                .stream()
                .sorted((t1, t2) -> t2.getTransactionDate().compareTo(t1.getTransactionDate()))
                .limit(5)
                .map(transactionMapper::toDTO)
                .collect(Collectors.toList());

        return new DashboardSummaryDTO(
                totalBalance,
                monthlyIncome,
                monthlyExpense,
                netIncome,
                budgetSummary,
                spendingComparison,
                quickStats,
                recentTransactions
        );
    }

    private BudgetSummary calculateBudgetSummary(Long userId, LocalDate monthStart, LocalDate monthEnd, LocalDate today) {
        List<Budget> currentBudgets = budgetService.getCurrentBudgets(userId, today);

        BigDecimal totalBudget = currentBudgets.stream()
                .map(Budget::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSpent = currentBudgets.stream()
                .map(Budget::getSpent)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = totalBudget.subtract(totalSpent);

        BigDecimal percentageUsed = BigDecimal.ZERO;
        if (totalBudget.compareTo(BigDecimal.ZERO) > 0) {
            percentageUsed = totalSpent
                    .divide(totalBudget, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        // Calculate days remaining in month
        long daysRemainingInMonth = ChronoUnit.DAYS.between(today, monthEnd) + 1;

        // Calculate safe to spend daily
        BigDecimal safeToSpendDaily = BigDecimal.ZERO;
        if (daysRemainingInMonth > 0 && remaining.compareTo(BigDecimal.ZERO) > 0) {
            safeToSpendDaily = remaining.divide(
                    BigDecimal.valueOf(daysRemainingInMonth),
                    2,
                    RoundingMode.HALF_UP
            );
        }

        return new BudgetSummary(
                totalBudget,
                totalSpent,
                remaining,
                percentageUsed,
                safeToSpendDaily,
                (int) daysRemainingInMonth
        );
    }

    private SpendingComparison calculateSpendingComparison(
            Long userId,
            LocalDate currentStart,
            LocalDate currentEnd,
            LocalDate prevStart,
            LocalDate prevEnd) {

        BigDecimal currentMonthSpending = transactionService.getTotalExpenseByDateRange(
                userId, currentStart, currentEnd);
        BigDecimal previousMonthSpending = transactionService.getTotalExpenseByDateRange(
                userId, prevStart, prevEnd);

        BigDecimal difference = currentMonthSpending.subtract(previousMonthSpending);

        BigDecimal percentageChange = BigDecimal.ZERO;
        if (previousMonthSpending.compareTo(BigDecimal.ZERO) > 0) {
            percentageChange = difference
                    .divide(previousMonthSpending, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        String trend = "STABLE";
        if (percentageChange.compareTo(BigDecimal.valueOf(5)) > 0) {
            trend = "UP";
        } else if (percentageChange.compareTo(BigDecimal.valueOf(-5)) < 0) {
            trend = "DOWN";
        }

        return new SpendingComparison(
                currentMonthSpending,
                previousMonthSpending,
                difference,
                percentageChange,
                trend
        );
    }

    private QuickStats calculateQuickStats(Long userId, LocalDate monthStart, LocalDate monthEnd) {
        List<Transaction> allTransactions = transactionService.getTransactionsByUserId(userId);
        List<Transaction> monthlyTransactions = transactionService.getTransactionsByDateRange(
                userId, monthStart, monthEnd);

        int totalAccounts = accountService.getAccountsByUserId(userId).size();
        int activeAccounts = accountService.getActiveAccountsByUserId(userId).size();

        LocalDate lastTransactionDate = allTransactions.stream()
                .map(Transaction::getTransactionDate)
                .max(LocalDate::compareTo)
                .orElse(null);

        return new QuickStats(
                totalAccounts,
                activeAccounts,
                allTransactions.size(),
                monthlyTransactions.size(),
                lastTransactionDate
        );
    }
}