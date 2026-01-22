package com.easytrack.backend.mapper;

import com.easytrack.backend.dto.TransactionDTO;
import com.easytrack.backend.entity.Account;
import com.easytrack.backend.entity.Category;
import com.easytrack.backend.entity.Transaction;
import com.easytrack.backend.entity.User;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    public TransactionDTO toDTO(Transaction transaction) {
        if (transaction == null) return null;

        TransactionDTO dto = new TransactionDTO();
        dto.setId(transaction.getId());
        dto.setUserId(transaction.getUser().getId());
        dto.setAccountId(transaction.getAccount().getId());
        dto.setCategoryId(transaction.getCategory().getId());
        dto.setType(transaction.getType()); // Keep as enum
        dto.setAmount(transaction.getAmount());
        dto.setTransactionDate(transaction.getTransactionDate());
        dto.setDescription(transaction.getDescription());
        dto.setNotes(transaction.getNotes());
        dto.setReceiptUrl(transaction.getReceiptUrl());
        dto.setCreatedAt(transaction.getCreatedAt());
        dto.setUpdatedAt(transaction.getUpdatedAt());
        return dto;
    }

    public Transaction toEntity(TransactionDTO dto, User user, Account account, Category category) {
        if (dto == null) return null;

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAccount(account);
        transaction.setCategory(category);
        transaction.setType(dto.getType()); // Keep as enum
        transaction.setAmount(dto.getAmount());
        transaction.setTransactionDate(dto.getTransactionDate());
        transaction.setDescription(dto.getDescription());
        transaction.setNotes(dto.getNotes());
        transaction.setReceiptUrl(dto.getReceiptUrl());
        return transaction;
    }

    public void updateEntityFromDTO(TransactionDTO dto, Transaction transaction,
                                    Account account, Category category) {
        if (account != null) {
            transaction.setAccount(account);
        }
        if (category != null) {
            transaction.setCategory(category);
        }
        if (dto.getType() != null) {
            transaction.setType(dto.getType());
        }
        if (dto.getAmount() != null) {
            transaction.setAmount(dto.getAmount());
        }
        if (dto.getTransactionDate() != null) {
            transaction.setTransactionDate(dto.getTransactionDate());
        }
        if (dto.getDescription() != null) {
            transaction.setDescription(dto.getDescription());
        }
        if (dto.getNotes() != null) {
            transaction.setNotes(dto.getNotes());
        }
        if (dto.getReceiptUrl() != null) {
            transaction.setReceiptUrl(dto.getReceiptUrl());
        }
    }
}