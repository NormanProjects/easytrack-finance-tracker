package com.easytrack.backend.mapper;

import com.easytrack.backend.dto.BudgetDTO;
import com.easytrack.backend.entity.Budget;
import com.easytrack.backend.entity.Category;
import com.easytrack.backend.entity.User;
import org.springframework.stereotype.Component;

@Component
public class BudgetMapper {

    public BudgetDTO toDTO(Budget budget) {
        if (budget == null) return null;

        BudgetDTO dto = new BudgetDTO();
        dto.setId(budget.getId());
        dto.setUserId(budget.getUser().getId());
        dto.setCategoryId(budget.getCategory().getId());
        dto.setAmount(budget.getAmount());
        dto.setSpent(budget.getSpent());
        dto.setPeriod(budget.getPeriod());
        dto.setStartDate(budget.getStartDate());
        dto.setEndDate(budget.getEndDate());
        dto.setIsActive(budget.getIsActive());
        dto.setCreatedAt(budget.getCreatedAt());
        dto.setUpdatedAt(budget.getUpdatedAt());
        return dto;
    }

    public Budget toEntity(BudgetDTO dto, User user, Category category) {
        if (dto == null) return null;

        Budget budget = new Budget();
        budget.setUser(user);
        budget.setCategory(category);
        budget.setAmount(dto.getAmount());
        budget.setSpent(dto.getSpent());
        budget.setPeriod(dto.getPeriod());
        budget.setStartDate(dto.getStartDate());
        budget.setEndDate(dto.getEndDate());
        budget.setIsActive(dto.getIsActive());
        return budget;
    }

    public void updateEntityFromDTO(BudgetDTO dto, Budget budget, Category category) {
        if (category != null) {
            budget.setCategory(category);
        }
        if (dto.getAmount() != null) {
            budget.setAmount(dto.getAmount());
        }
        if (dto.getPeriod() != null) {
            budget.setPeriod(dto.getPeriod());
        }
        if (dto.getStartDate() != null) {
            budget.setStartDate(dto.getStartDate());
        }
        if (dto.getEndDate() != null) {
            budget.setEndDate(dto.getEndDate());
        }
        if (dto.getIsActive() != null) {
            budget.setIsActive(dto.getIsActive());
        }
    }
}