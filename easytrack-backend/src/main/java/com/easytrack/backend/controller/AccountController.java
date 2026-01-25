package com.easytrack.backend.controller;

import com.easytrack.backend.dto.AccountDTO;
import com.easytrack.backend.entity.Account;
import com.easytrack.backend.entity.User;
import com.easytrack.backend.mapper.AccountMapper;
import com.easytrack.backend.service.AccountService;
import com.easytrack.backend.util.SecurityUtil;
import com.easytrack.backend.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Tag(name = "Account Management", description = "APIs for managing financial accounts")
public class AccountController {

    private final AccountService accountService;
    private final AccountMapper accountMapper;
    private final SecurityUtil securityUtil;

    @PostMapping
    @Operation(summary = "Create a new account")
    public ResponseEntity<AccountDTO> createAccount(@Valid @RequestBody AccountDTO accountDTO) {
        User user = securityUtil.getAuthenticatedUser();

        Account account = accountMapper.toEntity(accountDTO, user);
        Account createdAccount = accountService.createAccount(account);
        return new ResponseEntity<>(accountMapper.toDTO(createdAccount), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get account by ID")
    public ResponseEntity<AccountDTO> getAccountById(@PathVariable Long id) {
        Long userId = securityUtil.getAuthenticatedUserId();

        return accountService.getAccountById(id)
                .filter(account -> account.getUser().getId().equals(userId))
                .map(account -> ResponseEntity.ok(accountMapper.toDTO(account)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "Get all accounts for authenticated user")
    public ResponseEntity<List<AccountDTO>> getAllAccounts() {
        Long userId = securityUtil.getAuthenticatedUserId();

        List<AccountDTO> accounts = accountService.getAccountsByUserId(userId).stream()
                .map(accountMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active accounts for authenticated user")
    public ResponseEntity<List<AccountDTO>> getActiveAccounts() {
        Long userId = securityUtil.getAuthenticatedUserId();

        List<AccountDTO> accounts = accountService.getActiveAccountsByUserId(userId).stream()
                .map(accountMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/total-balance")
    @Operation(summary = "Get total balance for authenticated user")
    public ResponseEntity<BigDecimal> getTotalBalance() {
        Long userId = securityUtil.getAuthenticatedUserId();
        return ResponseEntity.ok(accountService.getTotalBalance(userId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update account")
    public ResponseEntity<AccountDTO> updateAccount(@PathVariable Long id, @Valid @RequestBody AccountDTO accountDTO) {
        Long userId = securityUtil.getAuthenticatedUserId();

        Account account = accountService.getAccountById(id)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", id));

        accountMapper.updateEntityFromDTO(accountDTO, account);
        Account updatedAccount = accountService.updateAccount(id, account);
        return ResponseEntity.ok(accountMapper.toDTO(updatedAccount));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete account")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        Long userId = securityUtil.getAuthenticatedUserId();

        Account account = accountService.getAccountById(id)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", id));

        accountService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }
}