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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.ArrayList;
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
        System.out.println(" Create account requested");

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("   User: " + auth.getName());
            System.out.println("   Account: " + accountDTO);

            if ("demo@test.com".equals(auth.getName())) {
                System.out.println("    Mock user - returning mock account (not saved to DB)");

                AccountDTO mockAccount = new AccountDTO();
                mockAccount.setId(999L);
                mockAccount.setName(accountDTO.getName());
                mockAccount.setType(accountDTO.getType());
                mockAccount.setBalance(accountDTO.getBalance());
                mockAccount.setCurrency(accountDTO.getCurrency() != null ? accountDTO.getCurrency() : "ZAR");
                mockAccount.setIsActive(true);  // ← FIXED: setIsActive not setActive

                System.out.println("    Returning mock account");
                return ResponseEntity.status(HttpStatus.CREATED).body(mockAccount);
            }

            User user = securityUtil.getAuthenticatedUser();
            Account account = accountMapper.toEntity(accountDTO, user);
            Account createdAccount = accountService.createAccount(account);
            System.out.println("    Account created: " + createdAccount.getId());
            return new ResponseEntity<>(accountMapper.toDTO(createdAccount), HttpStatus.CREATED);

        } catch (Exception e) {
            System.err.println("    Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get account by ID")
    public ResponseEntity<AccountDTO> getAccountById(@PathVariable Long id) {
        System.out.println(" Get account by ID: " + id);

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            if ("demo@test.com".equals(auth.getName())) {
                System.out.println("   ️ Mock user - no accounts");
                return ResponseEntity.notFound().build();
            }

            Long userId = securityUtil.getAuthenticatedUserId();
            return accountService.getAccountById(id)
                    .filter(account -> account.getUser().getId().equals(userId))
                    .map(account -> ResponseEntity.ok(accountMapper.toDTO(account)))
                    .orElse(ResponseEntity.notFound().build());

        } catch (Exception e) {
            System.err.println("    Error: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    @Operation(summary = "Get all accounts for authenticated user")
    public ResponseEntity<List<AccountDTO>> getAllAccounts() {
        System.out.println("🔍 Get all accounts requested");

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("   User: " + auth.getName());

            if ("demo@test.com".equals(auth.getName())) {
                System.out.println("    Mock user - returning empty accounts list");
                return ResponseEntity.ok(new ArrayList<>());
            }

            Long userId = securityUtil.getAuthenticatedUserId();
            List<AccountDTO> accounts = accountService.getAccountsByUserId(userId).stream()
                    .map(accountMapper::toDTO)
                    .collect(Collectors.toList());
            System.out.println("   Found " + accounts.size() + " accounts");
            return ResponseEntity.ok(accounts);

        } catch (Exception e) {
            System.err.println("   Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/active")
    @Operation(summary = "Get active accounts for authenticated user")
    public ResponseEntity<List<AccountDTO>> getActiveAccounts() {
        System.out.println("Get active accounts requested");

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            if ("demo@test.com".equals(auth.getName())) {
                System.out.println("    Mock user - returning empty list");
                return ResponseEntity.ok(new ArrayList<>());
            }

            Long userId = securityUtil.getAuthenticatedUserId();
            List<AccountDTO> accounts = accountService.getActiveAccountsByUserId(userId).stream()
                    .map(accountMapper::toDTO)
                    .collect(Collectors.toList());
            System.out.println("    Found " + accounts.size() + " active accounts");
            return ResponseEntity.ok(accounts);

        } catch (Exception e) {
            System.err.println("    Error: " + e.getMessage());
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/total-balance")
    @Operation(summary = "Get total balance for authenticated user")
    public ResponseEntity<BigDecimal> getTotalBalance() {
        System.out.println(" Get total balance requested");

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            if ("demo@test.com".equals(auth.getName())) {
                System.out.println("    Mock user - returning zero balance");
                return ResponseEntity.ok(BigDecimal.ZERO);
            }

            Long userId = securityUtil.getAuthenticatedUserId();
            BigDecimal balance = accountService.getTotalBalance(userId);
            System.out.println("    Total balance: " + balance);
            return ResponseEntity.ok(balance);

        } catch (Exception e) {
            System.err.println("    Error: " + e.getMessage());
            return ResponseEntity.ok(BigDecimal.ZERO);
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update account")
    public ResponseEntity<AccountDTO> updateAccount(@PathVariable Long id, @Valid @RequestBody AccountDTO accountDTO) {
        System.out.println(" Update account requested: " + id);

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            if ("demo@test.com".equals(auth.getName())) {
                System.out.println("    Mock user - returning mock update response (not saved to DB)");

                AccountDTO mockAccount = new AccountDTO();
                mockAccount.setId(id);
                mockAccount.setName(accountDTO.getName());
                mockAccount.setType(accountDTO.getType());
                mockAccount.setBalance(accountDTO.getBalance());
                mockAccount.setCurrency(accountDTO.getCurrency());
                // ← FIXED: use setIsActive / getIsActive
                mockAccount.setIsActive(accountDTO.getIsActive() != null ? accountDTO.getIsActive() : true);

                System.out.println("    Returning mock updated account");
                return ResponseEntity.ok(mockAccount);
            }

            Long userId = securityUtil.getAuthenticatedUserId();
            Account account = accountService.getAccountById(id)
                    .filter(a -> a.getUser().getId().equals(userId))
                    .orElseThrow(() -> new ResourceNotFoundException("Account", "id", id));

            accountMapper.updateEntityFromDTO(accountDTO, account);
            Account updatedAccount = accountService.updateAccount(id, account);
            System.out.println("    Account updated");
            return ResponseEntity.ok(accountMapper.toDTO(updatedAccount));

        } catch (ResourceNotFoundException e) {
            System.err.println("    Account not found: " + id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("    Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete account")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        System.out.println(" Delete account requested: " + id);

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            if ("demo@test.com".equals(auth.getName())) {
                System.out.println("    Mock user - returning mock delete response (not deleted from DB)");
                return ResponseEntity.noContent().build();
            }

            Long userId = securityUtil.getAuthenticatedUserId();
            Account account = accountService.getAccountById(id)
                    .filter(a -> a.getUser().getId().equals(userId))
                    .orElseThrow(() -> new ResourceNotFoundException("Account", "id", id));

            accountService.deleteAccount(id);
            System.out.println("    Account deleted");
            return ResponseEntity.noContent().build();

        } catch (ResourceNotFoundException e) {
            System.err.println("    Account not found: " + id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("    Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}