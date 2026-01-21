package com.easytrack.backend.service;

import com.easytrack.backend.entity.RecurringTransaction;
import com.easytrack.backend.entity.Transaction;
import com.easytrack.backend.repository.RecurringTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class RecurringTransactionService {

    private final RecurringTransactionRepository recurringTransactionRepository;
    private final TransactionService transactionService;

    public RecurringTransaction createRecurringTransaction(RecurringTransaction recurringTransaction) {

        if (recurringTransaction.getNextOccurrence() == null) {
            recurringTransaction.setNextOccurrence(recurringTransaction.getStartDate());
        }
        return recurringTransactionRepository.save(recurringTransaction);
    }

    public Optional<RecurringTransaction> getRecurringTransactionById(Long id) {
        return recurringTransactionRepository.findById(id);
    }

    public List<RecurringTransaction> getAllRecurringTransactions() {
        return recurringTransactionRepository.findAll();
    }

    public List<RecurringTransaction> getRecurringTransactionsByUserId(Long userId) {
        return recurringTransactionRepository.findByUserId(userId);
    }

    public List<RecurringTransaction> getActiveRecurringTransactionsByUserId(Long userId) {
        return recurringTransactionRepository.findByUserIdAndIsActive(userId, true);
    }

    public RecurringTransaction updateRecurringTransaction(Long id, RecurringTransaction details) {
        RecurringTransaction recurringTransaction = recurringTransactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recurring transaction not found"));

        recurringTransaction.setAccount(details.getAccount());
        recurringTransaction.setCategory(details.getCategory());
        recurringTransaction.setType(details.getType());
        recurringTransaction.setAmount(details.getAmount());
        recurringTransaction.setTitle(details.getTitle());
        recurringTransaction.setDescription(details.getDescription());
        recurringTransaction.setFrequency(details.getFrequency());
        recurringTransaction.setStartDate(details.getStartDate());
        recurringTransaction.setEndDate(details.getEndDate());
        recurringTransaction.setIsActive(details.getIsActive());

        return recurringTransactionRepository.save(recurringTransaction);
    }

    public void deleteRecurringTransaction(Long id) {
        if (!recurringTransactionRepository.existsById(id)) {
            throw new RuntimeException("Recurring transaction not found");
        }
        recurringTransactionRepository.deleteById(id);
    }

    public void processRecurringTransactions() {
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> dueTransactions =
                recurringTransactionRepository.findByIsActiveTrueAndNextOccurrenceLessThanEqual(today);

        for (RecurringTransaction recurring : dueTransactions) {
            // Create actual transaction
            Transaction transaction = new Transaction();
            transaction.setUser(recurring.getUser());
            transaction.setAccount(recurring.getAccount());
            transaction.setCategory(recurring.getCategory());
            transaction.setType(Transaction.TransactionType.valueOf(recurring.getType().name()));
            transaction.setAmount(recurring.getAmount());
            transaction.setTransactionDate(recurring.getNextOccurrence());
            transaction.setDescription(recurring.getDescription());
            transaction.setNotes("Auto-generated from recurring transaction: " + recurring.getTitle());

            transactionService.createTransaction(transaction);

            // Update next occurrence
            LocalDate nextOccurrence = calculateNextOccurrence(recurring.getNextOccurrence(), recurring.getFrequency());

            // Check if we've passed the end date
            if (recurring.getEndDate() != null && nextOccurrence.isAfter(recurring.getEndDate())) {
                recurring.setIsActive(false);
            } else {
                recurring.setNextOccurrence(nextOccurrence);
            }

            recurringTransactionRepository.save(recurring);
        }
    }

    private LocalDate calculateNextOccurrence(LocalDate currentDate, RecurringTransaction.Frequency frequency) {
        if (frequency == RecurringTransaction.Frequency.DAILY) {
            return currentDate.plusDays(1);
        } else if (frequency == RecurringTransaction.Frequency.WEEKLY) {
            return currentDate.plusWeeks(1);
        } else if (frequency == RecurringTransaction.Frequency.MONTHLY) {
            return currentDate.plusMonths(1);
        } else if (frequency == RecurringTransaction.Frequency.YEARLY) {
            return currentDate.plusYears(1);
        }
        return currentDate;
    }
}
