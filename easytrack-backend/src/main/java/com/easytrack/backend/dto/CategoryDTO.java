package com.easytrack.backend.dto;

import com.easytrack.backend.entity.Category;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {
 private Long id;

 // Remove @NotNull - userId comes from JWT now
 private Long userId;

 @NotBlank(message = "Category name is required")
 @Size(max = 100, message = "Category name must not exceed 100 characters")
 private String name;

 @NotNull(message = "Category type is required")
 private Category.CategoryType type; // INCOME or EXPENSE

 @Size(max = 50, message = "Icon must not exceed 50 characters")
 private String icon;

 @Size(max = 20, message = "Color must not exceed 20 characters")
 private String color;

 private Boolean isDefault;
 private LocalDateTime createdAt;
 private LocalDateTime updatedAt;
}