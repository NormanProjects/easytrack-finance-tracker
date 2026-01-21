package com.easytrack.backend.service;

import com.easytrack.backend.entity.Account;
import com.easytrack.backend.entity.Transaction;
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
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountService accountService;

    public Transaction createTransaction(Transaction transaction) {
        // Update account balance
        Account account = accountService.getAccountById(transaction.getAccount().getId())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        BigDecimal amount = transaction.getAmount();
        if (transaction.getType() == Transaction.TransactionType.EXPENSE) {
            amount = amount.negate();
        }

        accountService.updateAccountBalance(account.getId(), amount);

        return transactionRepository.save(transaction);
    }

    public Optional<Transaction> getTransactionById(Long id) {
        return transactionRepository.findById(id);
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public List<Transaction> getTransactionsByUserId(Long userId) {
        return transactionRepository.findByUserId(userId);
    }

    public List<Transaction> getTransactionsByUserIdAndType(Long userId, Transaction.TransactionType type) {
        return transactionRepository.findByUserIdAndType(userId, type);
    }

    public List<Transaction> getTransactionsByAccountId(Long userId, Long accountId) {
        return transactionRepository.findByUserIdAndAccountId(userId, accountId);
    }

    public List<Transaction> getTransactionsByCategoryId(Long userId, Long categoryId) {
        return transactionRepository.findByUserIdAndCategoryId(userId, categoryId);
    }

    public List<Transaction> getTransactionsByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByUserIdAndTransactionDateBetween(userId, startDate, endDate);
    }

    public Transaction updateTransaction(Long id, Transaction transactionDetails) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        // Revert old transaction from account balance
        BigDecimal oldAmount = transaction.getAmount();
        if (transaction.getType() == Transaction.TransactionType.EXPENSE) {
            oldAmount = oldAmount.negate();
        }
        accountService.updateAccountBalance(transaction.getAccount().getId(), oldAmount.negate());

        // Update transaction details
        transaction.setAccount(transactionDetails.getAccount());
        transaction.setCategory(transactionDetails.getCategory());
        transaction.setType(transactionDetails.getType());
        transaction.setAmount(transactionDetails.getAmount());
        transaction.setTransactionDate(transactionDetails.getTransactionDate());
        transaction.setDescription(transactionDetails.getDescription());
        transaction.setNotes(transactionDetails.getNotes());
        transaction.setReceiptUrl(transactionDetails.getReceiptUrl());

        // Apply new transaction to account balance
        BigDecimal newAmount = transaction.getAmount();
        if (transaction.getType() == Transaction.TransactionType.EXPENSE) {
            newAmount = newAmount.negate();
        }
        accountService.updateAccountBalance(transaction.getAccount().getId(), newAmount);

        return transactionRepository.save(transaction);
    }

    public void deleteTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        // Revert transaction from account balance
        BigDecimal amount = transaction.getAmount();
        if (transaction.getType() == Transaction.TransactionType.EXPENSE) {
            amount = amount.negate();
        }
        accountService.updateAccountBalance(transaction.getAccount().getId(), amount.negate());

        transactionRepository.deleteById(id);
    }

    public BigDecimal getTotalIncomeByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        BigDecimal total = transactionRepository.sumByUserIdAndTypeAndDateRange(
                userId, Transaction.TransactionType.INCOME, startDate, endDate);
        return total != null ? total : BigDecimal.ZERO;
    }

    public BigDecimal getTotalExpenseByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        BigDecimal total = transactionRepository.sumByUserIdAndTypeAndDateRange(
                userId, Transaction.TransactionType.EXPENSE, startDate, endDate);
        return total != null ? total : BigDecimal.ZERO;
    }

    public BigDecimal getNetIncomeByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        BigDecimal income = getTotalIncomeByDateRange(userId, startDate, endDate);
        BigDecimal expense = getTotalExpenseByDateRange(userId, startDate, endDate);
        return income.subtract(expense);
    }
}