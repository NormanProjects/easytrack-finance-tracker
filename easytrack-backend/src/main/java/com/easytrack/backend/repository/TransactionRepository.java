package com.easytrack.backend.repository;

import com.easytrack.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);
    List<Transaction> findByUserIdAndType(Long userId, Transaction.TransactionType type);
    List<Transaction> findByUserIdAndAccountId(Long userId, Long accountId);
    List<Transaction> findByUserIdAndCategoryId(Long userId, Long categoryId);

    List<Transaction> findByUserIdAndTransactionDateBetween(
            Long userId,
            LocalDate startDate,
            LocalDate endDate
    );

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId " +
            "AND t.type = :type AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByUserIdAndTypeAndDateRange(
            @Param("userId") Long userId,
            @Param("type") Transaction.TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId " +
            "AND t.category.id = :categoryId AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByCategoryAndDateRange(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}