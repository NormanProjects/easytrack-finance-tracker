package com.easytrack.backend.repository;

import com.easytrack.backend.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserId(Long userId);
    List<Account> findByUserIdAndIsActive(Long userId, Boolean isActive);
    List<Account> findByUserIdAndType(Long userId, Account.AccountType type);
}