package com.easytrack.backend.controller;

import com.easytrack.backend.dto.CategoryDTO;
import com.easytrack.backend.entity.Category;
import com.easytrack.backend.entity.User;
import com.easytrack.backend.mapper.CategoryMapper;
import com.easytrack.backend.service.CategoryService;
import com.easytrack.backend.util.SecurityUtil;
import com.easytrack.backend.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Category Management", description = "APIs for managing income/expense categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final CategoryMapper categoryMapper;
    private final SecurityUtil securityUtil;

    @PostMapping
    @Operation(summary = "Create a new category")
    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
        User user = securityUtil.getAuthenticatedUser();

        Category category = categoryMapper.toEntity(categoryDTO, user);
        Category createdCategory = categoryService.createCategory(category);
        return new ResponseEntity<>(categoryMapper.toDTO(createdCategory), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Long id) {
        Long userId = securityUtil.getAuthenticatedUserId();

        return categoryService.getCategoryById(id)
                .filter(category -> category.getUser().getId().equals(userId))
                .map(category -> ResponseEntity.ok(categoryMapper.toDTO(category)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "Get all categories for authenticated user")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        Long userId = securityUtil.getAuthenticatedUserId();

        List<CategoryDTO> categories = categoryService.getCategoriesByUserId(userId).stream()
                .map(categoryMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Get categories by type for authenticated user")
    public ResponseEntity<List<CategoryDTO>> getCategoriesByType(@PathVariable Category.CategoryType type) {
        Long userId = securityUtil.getAuthenticatedUserId();

        List<CategoryDTO> categories = categoryService.getCategoriesByUserIdAndType(userId, type).stream()
                .map(categoryMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update category")
    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryDTO categoryDTO) {
        Long userId = securityUtil.getAuthenticatedUserId();

        Category category = categoryService.getCategoryById(id)
                .filter(c -> c.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        categoryMapper.updateEntityFromDTO(categoryDTO, category);
        Category updatedCategory = categoryService.updateCategory(id, category);
        return ResponseEntity.ok(categoryMapper.toDTO(updatedCategory));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete category")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        Long userId = securityUtil.getAuthenticatedUserId();

        categoryService.getCategoryById(id)
                .filter(c -> c.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}