package com.easytrack.backend.repository;

import com.easytrack.backend.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserId(Long userId);
    List<Budget> findByUserIdAndIsActive(Long userId, Boolean isActive);
    List<Budget> findByUserIdAndCategoryId(Long userId, Long categoryId);

    Optional<Budget> findByUserIdAndCategoryIdAndStartDateAndEndDate(
            Long userId,
            Long categoryId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<Budget> findByUserIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long userId,
            LocalDate date,
            LocalDate date2
    );
}