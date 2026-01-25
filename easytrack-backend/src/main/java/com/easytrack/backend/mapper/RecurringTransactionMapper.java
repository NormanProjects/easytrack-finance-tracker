package com.easytrack.backend.mapper;

import com.easytrack.backend.dto.RecurringTransactionDTO;
import com.easytrack.backend.entity.Account;
import com.easytrack.backend.entity.Category;
import com.easytrack.backend.entity.RecurringTransaction;
import com.easytrack.backend.entity.User;
import org.springframework.stereotype.Component;

@Component
public class RecurringTransactionMapper {

    public RecurringTransactionDTO toDTO(RecurringTransaction recurringTransaction) {
        if (recurringTransaction == null) return null;

        RecurringTransactionDTO dto = new RecurringTransactionDTO();
        dto.setId(recurringTransaction.getId());
        dto.setUserId(recurringTransaction.getUser().getId());
        dto.setAccountId(recurringTransaction.getAccount().getId());
        dto.setCategoryId(recurringTransaction.getCategory().getId());
        dto.setType(recurringTransaction.getType().name());
        dto.setAmount(recurringTransaction.getAmount());
        dto.setTitle(recurringTransaction.getTitle());
        dto.setDescription(recurringTransaction.getDescription());
        dto.setFrequency(recurringTransaction.getFrequency().name());
        dto.setStartDate(recurringTransaction.getStartDate());
        dto.setEndDate(recurringTransaction.getEndDate());
        dto.setNextOccurrence(recurringTransaction.getNextOccurrence());
        dto.setIsActive(recurringTransaction.getIsActive());
        dto.setCreatedAt(recurringTransaction.getCreatedAt());
        dto.setUpdatedAt(recurringTransaction.getUpdatedAt());
        return dto;
    }

    public RecurringTransaction toEntity(RecurringTransactionDTO dto, User user, Account account, Category category) {
        if (dto == null) return null;

        RecurringTransaction recurringTransaction = new RecurringTransaction();
        recurringTransaction.setUser(user);
        recurringTransaction.setAccount(account);
        recurringTransaction.setCategory(category);
        recurringTransaction.setType(RecurringTransaction.TransactionType.valueOf(dto.getType()));
        recurringTransaction.setAmount(dto.getAmount());
        recurringTransaction.setTitle(dto.getTitle());
        recurringTransaction.setDescription(dto.getDescription());
        recurringTransaction.setFrequency(RecurringTransaction.Frequency.valueOf(dto.getFrequency()));
        recurringTransaction.setStartDate(dto.getStartDate());
        recurringTransaction.setEndDate(dto.getEndDate());
        recurringTransaction.setNextOccurrence(dto.getNextOccurrence());
        recurringTransaction.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        return recurringTransaction;
    }

    public void updateEntityFromDTO(RecurringTransactionDTO dto, RecurringTransaction recurringTransaction,
                                    Account account, Category category) {
        if (account != null) {
            recurringTransaction.setAccount(account);
        }
        if (category != null) {
            recurringTransaction.setCategory(category);
        }
        if (dto.getType() != null) {
            recurringTransaction.setType(RecurringTransaction.TransactionType.valueOf(dto.getType()));
        }
        if (dto.getAmount() != null) {
            recurringTransaction.setAmount(dto.getAmount());
        }
        if (dto.getTitle() != null) {
            recurringTransaction.setTitle(dto.getTitle());
        }
        if (dto.getDescription() != null) {
            recurringTransaction.setDescription(dto.getDescription());
        }
        if (dto.getFrequency() != null) {
            recurringTransaction.setFrequency(RecurringTransaction.Frequency.valueOf(dto.getFrequency()));
        }
        if (dto.getStartDate() != null) {
            recurringTransaction.setStartDate(dto.getStartDate());
        }
        if (dto.getEndDate() != null) {
            recurringTransaction.setEndDate(dto.getEndDate());
        }
        if (dto.getIsActive() != null) {
            recurringTransaction.setIsActive(dto.getIsActive());
        }
    }
}