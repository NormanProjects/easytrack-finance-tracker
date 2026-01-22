package com.easytrack.backend.service;

import com.easytrack.backend.entity.Account;
import com.easytrack.backend.exception.ResourceNotFoundException;
import com.easytrack.backend.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class AccountService {

    private final AccountRepository accountRepository;

    public Account createAccount(Account account) {
        return accountRepository.save(account);
    }

    public Optional<Account> getAccountById(Long id) {
        return accountRepository.findById(id);
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public List<Account> getAccountsByUserId(Long userId) {
        return accountRepository.findByUserId(userId);
    }

    public List<Account> getActiveAccountsByUserId(Long userId) {
        return accountRepository.findByUserIdAndIsActive(userId, true);
    }

    public List<Account> getAccountsByUserIdAndType(Long userId, Account.AccountType type) {
        return accountRepository.findByUserIdAndType(userId, type);
    }

    public Account updateAccount(Long id, Account accountDetails) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", id));

        account.setName(accountDetails.getName());
        account.setType(accountDetails.getType());
        account.setBalance(accountDetails.getBalance());
        account.setCurrency(accountDetails.getCurrency());
        account.setIcon(accountDetails.getIcon());
        account.setColor(accountDetails.getColor());
        account.setIsActive(accountDetails.getIsActive());

        return accountRepository.save(account);
    }

    public void updateAccountBalance(Long accountId, BigDecimal amount) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId));
        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);
    }

    public void deleteAccount(Long id) {
        if (!accountRepository.existsById(id)) {
            throw new ResourceNotFoundException("Account", "id", id);
        }
        accountRepository.deleteById(id);
    }

    public BigDecimal getTotalBalance(Long userId) {
        List<Account> accounts = getActiveAccountsByUserId(userId);
        return accounts.stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}