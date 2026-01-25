package com.easytrack.backend.dto;

import com.easytrack.backend.entity.Account;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountDTO {
 private Long id;


 private Long userId;

 @NotBlank(message = "Account name is required")
 @Size(max = 100, message = "Account name must not exceed 100 characters")
 private String name;

 @NotNull(message = "Account type is required")
 private Account.AccountType type;

 @NotNull(message = "Balance is required")
 private BigDecimal balance;

 @Size(max = 10, message = "Currency must not exceed 10 characters")
 private String currency;

 @Size(max = 50, message = "Icon must not exceed 50 characters")
 private String icon;

 @Size(max = 20, message = "Color must not exceed 20 characters")
 private String color;

 private Boolean isActive;
 private LocalDateTime createdAt;
 private LocalDateTime updatedAt;
}