package com.easytrack.backend.repository;

import com.easytrack.backend.entity.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {
    List<RecurringTransaction> findByUserId(Long userId);
    List<RecurringTransaction> findByUserIdAndIsActive(Long userId, Boolean isActive);
    List<RecurringTransaction> findByUserIdAndType(Long userId, String type);

    List<RecurringTransaction> findByIsActiveTrueAndNextOccurrenceLessThanEqual(LocalDate date);
}