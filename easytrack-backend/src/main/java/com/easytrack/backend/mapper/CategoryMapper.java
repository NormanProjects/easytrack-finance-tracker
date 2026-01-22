package com.easytrack.backend.mapper;

import com.easytrack.backend.dto.CategoryDTO;
import com.easytrack.backend.entity.Category;
import com.easytrack.backend.entity.User;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryDTO toDTO(Category category) {
        if (category == null) return null;

        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setUserId(category.getUser().getId());
        dto.setName(category.getName());
        dto.setType(category.getType()); // Keep as enum
        dto.setIcon(category.getIcon());
        dto.setColor(category.getColor());
        dto.setIsDefault(category.getIsDefault());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        return dto;
    }

    public Category toEntity(CategoryDTO dto, User user) {
        if (dto == null) return null;

        Category category = new Category();
        category.setUser(user);
        category.setName(dto.getName());
        category.setType(dto.getType()); // Keep as enum
        category.setIcon(dto.getIcon());
        category.setColor(dto.getColor());
        category.setIsDefault(dto.getIsDefault());
        return category;
    }

    public void updateEntityFromDTO(CategoryDTO dto, Category category) {
        if (dto.getName() != null) {
            category.setName(dto.getName());
        }
        if (dto.getType() != null) {
            category.setType(dto.getType());
        }
        if (dto.getIcon() != null) {
            category.setIcon(dto.getIcon());
        }
        if (dto.getColor() != null) {
            category.setColor(dto.getColor());
        }
    }
}