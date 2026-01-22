package com.easytrack.backend.controller;

import com.easytrack.backend.dto.AccountDTO;
import com.easytrack.backend.entity.Account;
import com.easytrack.backend.entity.User;
import com.easytrack.backend.mapper.AccountMapper;
import com.easytrack.backend.service.AccountService;
import com.easytrack.backend.service.UserService;
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
    private final UserService userService;
    private final AccountMapper accountMapper;

    @PostMapping
    @Operation(summary = "Create a new account")
    public ResponseEntity<AccountDTO> createAccount(@Valid @RequestBody AccountDTO accountDTO) {
        User user = userService.getUserById(accountDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Account account = accountMapper.toEntity(accountDTO, user);
        Account createdAccount = accountService.createAccount(account);
        return new ResponseEntity<>(accountMapper.toDTO(createdAccount), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get account by ID")
    public ResponseEntity<AccountDTO> getAccountById(@PathVariable Long id) {
        return accountService.getAccountById(id)
                .map(account -> ResponseEntity.ok(accountMapper.toDTO(account)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "Get all accounts")
    public ResponseEntity<List<AccountDTO>> getAllAccounts() {
        List<AccountDTO> accounts = accountService.getAllAccounts().stream()
                .map(accountMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get accounts by user ID")
    public ResponseEntity<List<AccountDTO>> getAccountsByUserId(@PathVariable Long userId) {
        List<AccountDTO> accounts = accountService.getAccountsByUserId(userId).stream()
                .map(accountMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/user/{userId}/active")
    @Operation(summary = "Get active accounts by user ID")
    public ResponseEntity<List<AccountDTO>> getActiveAccountsByUserId(@PathVariable Long userId) {
        List<AccountDTO> accounts = accountService.getActiveAccountsByUserId(userId).stream()
                .map(accountMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/user/{userId}/total-balance")
    @Operation(summary = "Get total balance for user")
    public ResponseEntity<BigDecimal> getTotalBalance(@PathVariable Long userId) {
        return ResponseEntity.ok(accountService.getTotalBalance(userId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update account")
    public ResponseEntity<AccountDTO> updateAccount(@PathVariable Long id, @Valid @RequestBody AccountDTO accountDTO) {
        Account account = accountService.getAccountById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        accountMapper.updateEntityFromDTO(accountDTO, account);
        Account updatedAccount = accountService.updateAccount(id, account);
        return ResponseEntity.ok(accountMapper.toDTO(updatedAccount));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete account")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }
}