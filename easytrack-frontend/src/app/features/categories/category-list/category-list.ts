import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, CategoryType } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category';


@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css'
})
export class CategoriesListComponent implements OnInit {
  categories: Category[] = [];
  incomeCategories: Category[] = [];
  expenseCategories: Category[] = [];
  isLoading: boolean = false;
  showForm: boolean = false;
  editingCategory: Category | null = null;

  // Form data
  categoryForm: Category = this.getEmptyCategory();
  
  // Category types
  CategoryType = CategoryType;
  categoryTypes = [
    { value: CategoryType.INCOME, label: 'Income', icon: '💰' },
    { value: CategoryType.EXPENSE, label: 'Expense', icon: '💸' }
  ];

  // Icon picker
  showIconPicker: boolean = false;
  availableIcons = [
    '💰', '💵', '💴', '💶', '💷', '💳', '🏦', '💎', '🎁', '🎉',
    '🍔', '🍕', '🍜', '☕', '🍺', '🛒', '🏪', '🛍️', '👕', '👟',
    '🏠', '🏡', '🔑', '💡', '🔧', '🚗', '⛽', '🚌', '✈️', '🏥',
    '💊', '🎓', '📚', '📱', '💻', '🎮', '🎬', '🎵', '🎨', '⚽',
    '🏋️', '🧘', '💇', '💅', '🎯', '🎪', '🎭', '📊', '📈', '📉'
  ];

  // Color picker
  showColorPicker: boolean = false;
  availableColors = [
    '#00FF94', '#00e085', '#10b981', '#3b82f6', '#8b5cf6',
    '#ec4899', '#ef4444', '#f59e0b', '#eab308', '#84cc16',
    '#06b6d4', '#6366f1', '#a855f7', '#f43f5e', '#fb923c'
  ];

  constructor(
    private categoryService: CategoryService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  /**
   * Load all categories
   */
  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.groupCategories();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoading = false;
        this.showError('Failed to load categories');
      }
    });
  }

  /**
   * Group categories by type
   */
  groupCategories(): void {
    this.incomeCategories = this.categories.filter(c => c.type === CategoryType.INCOME);
    this.expenseCategories = this.categories.filter(c => c.type === CategoryType.EXPENSE);
  }

  /**
   * Open form for new category
   */
  openNewCategoryForm(type: CategoryType): void {
    this.editingCategory = null;
    this.categoryForm = this.getEmptyCategory();
    this.categoryForm.type = type;
    this.showForm = true;
  }

  /**
   * Open form for editing category
   */
  editCategory(category: Category): void {
    this.editingCategory = category;
    this.categoryForm = { ...category };
    this.showForm = true;
  }

  /**
   * Save category (create or update)
   */
  saveCategory(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    if (this.editingCategory && this.editingCategory.id) {
      // Update existing category
      this.categoryService.update(this.editingCategory.id, this.categoryForm).subscribe({
        next: () => {
          this.showSuccess('Category updated successfully');
          this.closeForm();
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error updating category:', error);
          this.showError('Failed to update category');
          this.isLoading = false;
        }
      });
    } else {
      // Create new category
      this.categoryService.create(this.categoryForm).subscribe({
        next: () => {
          this.showSuccess('Category created successfully');
          this.closeForm();
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error creating category:', error);
          this.showError('Failed to create category');
          this.isLoading = false;
        }
      });
    }
  }

  /**
   * Delete category
   */
  deleteCategory(category: Category): void {
    if (!category.id) return;

    // Prevent deleting default categories
    if (category.isDefault) {
      this.showError('Cannot delete default categories');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    this.isLoading = true;
    this.categoryService.delete(category.id).subscribe({
      next: () => {
        this.showSuccess('Category deleted successfully');
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        this.showError('Failed to delete category');
        this.isLoading = false;
      }
    });
  }

  /**
   * Close form
   */
  closeForm(): void {
    this.showForm = false;
    this.editingCategory = null;
    this.categoryForm = this.getEmptyCategory();
    this.showIconPicker = false;
    this.showColorPicker = false;
  }

  /**
   * Validate form
   */
  validateForm(): boolean {
    if (!this.categoryForm.name || this.categoryForm.name.trim() === '') {
      this.showError('Category name is required');
      return false;
    }

    if (!this.categoryForm.type) {
      this.showError('Category type is required');
      return false;
    }

    return true;
  }

  /**
   * Get empty category object
   */
  getEmptyCategory(): Category {
    return {
      name: '',
      type: CategoryType.EXPENSE,
      icon: '📁',
      color: '#00FF94',
      isDefault: false
    };
  }

  /**
   * Select icon
   */
  selectIcon(icon: string): void {
    this.categoryForm.icon = icon;
    this.showIconPicker = false;
  }

  /**
   * Select color
   */
  selectColor(color: string): void {
    this.categoryForm.color = color;
    this.showColorPicker = false;
  }

  /**
   * Toggle icon picker
   */
  toggleIconPicker(): void {
    this.showIconPicker = !this.showIconPicker;
    this.showColorPicker = false;
  }

  /**
   * Toggle color picker
   */
  toggleColorPicker(): void {
    this.showColorPicker = !this.showColorPicker;
    this.showIconPicker = false;
  }

  /**
   * Get category count by type
   */
  getCategoryCount(type: CategoryType): number {
    return this.categories.filter(c => c.type === type).length;
  }

  /**
   * Show success message
   */
  showSuccess(message: string): void {
    if (isPlatformBrowser(this.platformId)) {
      alert(message); // Replace with toast notification
    }
  }

  /**
   * Show error message
   */
  showError(message: string): void {
    if (isPlatformBrowser(this.platformId)) {
      alert(message); // Replace with toast notification
    }
  }
}