package com.easytrack.backend.repository;

import com.easytrack.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserId(Long userId);
    List<Category> findByUserIdAndType(Long userId, Category.CategoryType type);
    List<Category> findByUserIdAndIsDefault(Long userId, Boolean isDefault);
}