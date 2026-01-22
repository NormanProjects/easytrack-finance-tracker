package com.easytrack.backend.dto;

import com.easytrack.backend.entity.Transaction;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {
    private Long id;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Account ID is required")
    private Long accountId;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Transaction type is required")
    private Transaction.TransactionType type; // INCOME or EXPENSE

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    @Size(max = 500, message = "Receipt URL must not exceed 500 characters")
    private String receiptUrl;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Additional fields for response enrichment
    private String categoryName;
    private String accountName;
}