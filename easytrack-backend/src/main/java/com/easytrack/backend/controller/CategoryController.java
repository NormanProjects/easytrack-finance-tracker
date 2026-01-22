package com.easytrack.backend.controller;

import com.easytrack.backend.dto.CategoryDTO;
import com.easytrack.backend.entity.Category;
import com.easytrack.backend.entity.User;
import com.easytrack.backend.mapper.CategoryMapper;
import com.easytrack.backend.service.CategoryService;
import com.easytrack.backend.service.UserService;
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
    private final UserService userService;
    private final CategoryMapper categoryMapper;

    @PostMapping
    @Operation(summary = "Create a new category")
    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
        User user = userService.getUserById(categoryDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Category category = categoryMapper.toEntity(categoryDTO, user);
        Category createdCategory = categoryService.createCategory(category);
        return new ResponseEntity<>(categoryMapper.toDTO(createdCategory), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id)
                .map(category -> ResponseEntity.ok(categoryMapper.toDTO(category)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "Get all categories")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        List<CategoryDTO> categories = categoryService.getAllCategories().stream()
                .map(categoryMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get categories by user ID")
    public ResponseEntity<List<CategoryDTO>> getCategoriesByUserId(@PathVariable Long userId) {
        List<CategoryDTO> categories = categoryService.getCategoriesByUserId(userId).stream()
                .map(categoryMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/user/{userId}/type/{type}")
    @Operation(summary = "Get categories by user ID and type")
    public ResponseEntity<List<CategoryDTO>> getCategoriesByUserIdAndType(
            @PathVariable Long userId,
            @PathVariable Category.CategoryType type) {
        List<CategoryDTO> categories = categoryService.getCategoriesByUserIdAndType(userId, type).stream()
                .map(categoryMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update category")
    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryDTO categoryDTO) {
        Category category = categoryService.getCategoryById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        categoryMapper.updateEntityFromDTO(categoryDTO, category);
        Category updatedCategory = categoryService.updateCategory(id, category);
        return ResponseEntity.ok(categoryMapper.toDTO(updatedCategory));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete category")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}