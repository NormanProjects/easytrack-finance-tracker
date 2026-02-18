package com.easytrack.backend.mapper;

import com.easytrack.backend.dto.AccountDTO;
import com.easytrack.backend.entity.Account;
import com.easytrack.backend.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class AccountMapper {

    public AccountDTO toDTO(Account account) {
        if (account == null) return null;

        AccountDTO dto = new AccountDTO();
        dto.setId(account.getId());
        dto.setUserId(account.getUser().getId());
        dto.setName(account.getName());
        dto.setType(account.getType());
        dto.setBalance(account.getBalance());
        dto.setCurrency(account.getCurrency());
        dto.setIcon(account.getIcon());
        dto.setColor(account.getColor());
        dto.setIsActive(account.getIsActive());
        dto.setCreatedAt(account.getCreatedAt());
        dto.setUpdatedAt(account.getUpdatedAt());
        return dto;
    }

    public Account toEntity(AccountDTO dto, User user) {
        if (dto == null) return null;

        Account account = new Account();
        account.setUser(user);
        account.setName(dto.getName());
        account.setType(dto.getType());
        account.setBalance(dto.getBalance() != null ? dto.getBalance() : BigDecimal.ZERO);
        account.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "ZAR");
        account.setIcon(dto.getIcon());
        account.setColor(dto.getColor());
        account.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        return account;
    }

    public void updateEntityFromDTO(AccountDTO dto, Account account) {
        if (dto.getName() != null) {
            account.setName(dto.getName());
        }
        if (dto.getType() != null) {
            account.setType(dto.getType());
        }
        if (dto.getBalance() != null) {
            account.setBalance(dto.getBalance());
        }
        if (dto.getCurrency() != null) {
            account.setCurrency(dto.getCurrency());
        }
        if (dto.getIcon() != null) {
            account.setIcon(dto.getIcon());
        }
        if (dto.getColor() != null) {
            account.setColor(dto.getColor());
        }
        if (dto.getIsActive() != null) {
            account.setIsActive(dto.getIsActive());
        }
    }
}