import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../../../core/services/budget';
import { CategoryService } from '../../../../core/services/category';
import { ToastService } from '../../../../core/services/toast';
import { Budget, BudgetPeriod } from '../../../../core/models/budget.model';
import { Category } from '../../../../core/models/category.model';

interface BudgetTip {
  type: 'success' | 'warning' | 'info';
  icon: string;
  title: string;
  message: string;
}

interface Period {
  label: string;
  value: BudgetPeriod;
}

@Component({
  selector: 'app-budget',
  imports: [CommonModule, FormsModule],
  templateUrl: './budget.html',
  styleUrl: './budget.css',
})
export class BudgetComponent implements OnInit {
  budgets: Budget[] = [];
  categories: Category[] = [];
  selectedPeriod: BudgetPeriod = BudgetPeriod.MONTHLY;
  isLoading: boolean = true;
  showForm: boolean = false;
  editingBudget: Budget | null = null;
  Math = Math;

  // Form data
  budgetForm: Partial<Budget> = this.getEmptyBudget();

  periods: Period[] = [
    { label: 'Weekly', value: BudgetPeriod.WEEKLY },
    { label: 'Monthly', value: BudgetPeriod.MONTHLY },
    { label: 'Yearly', value: BudgetPeriod.YEARLY }
  ];

  // Category colors and icons mapping
  categoryConfig: { [key: string]: { color: string; icon: string } } = {
    'Food & Dining': { color: '#FF6B6B', icon: '🍔' },
    'Transportation': { color: '#4ECDC4', icon: '🚗' },
    'Shopping': { color: '#FFD93D', icon: '🛍️' },
    'Entertainment': { color: '#C77DFF', icon: '🎮' },
    'Bills & Utilities': { color: '#FF8C42', icon: '💡' },
    'Healthcare': { color: '#06D6A0', icon: '🏥' },
    'Education': { color: '#118AB2', icon: '📚' },
    'Housing': { color: '#8D99AE', icon: '🏠' },
    'Personal Care': { color: '#FF69B4', icon: '💅' },
    'Savings': { color: '#00FF94', icon: '💰' },
    'Other': { color: '#6C757D', icon: '📌' }
  };

  constructor(
    private budgetService: BudgetService,
    private categoryService: CategoryService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadBudgets();
    
    // Fallback: If still loading after 10 seconds, reset
    setTimeout(() => {
      if (this.isLoading) {
        console.warn('⚠️ Loading timeout - resetting state');
        this.isLoading = false;
        this.toastService.warning('Request timed out. Please try again.');
      }
    }, 10000);
  }

  private loadCategories() {
    console.log('Loading categories...');
    
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        console.log('✅ Categories loaded successfully:', categories);
        this.categories = categories || [];
      },
      error: (error) => {
        console.error('❌ Error loading categories:', error);
        this.categories = [];
        this.toastService.error('Failed to load categories');
      }
    });
  }

  private loadBudgets() {
    this.isLoading = true;
    this.budgets = []; // Clear existing budgets
    console.log('Loading budgets...');
    
    // Load active budgets
    this.budgetService.getActive().subscribe({
      next: (budgets) => {
        console.log('✅ Budgets loaded successfully:', budgets);
        this.budgets = budgets || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading budgets:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          error: error.error
        });
        this.isLoading = false;
        this.budgets = [];
        
        // Show specific error message
        if (error.status === 0) {
          this.toastService.error('Cannot connect to server. Is the backend running?');
        } else if (error.status === 401) {
          this.toastService.error('Authentication failed. Please login again.');
        } else if (error.status === 403) {
          this.toastService.error('Access denied. Check your permissions.');
        } else {
          this.toastService.error(error.error?.message || 'Failed to load budgets');
        }
      }
    });
  }

  // Summary calculations
  getTotalBudget(): number {
    return this.budgets.reduce((sum, budget) => sum + budget.amount, 0);
  }

  getTotalSpent(): number {
    return this.budgets.reduce((sum, budget) => sum + (budget.spent || 0), 0);
  }

  getRemaining(): number {
    return this.getTotalBudget() - this.getTotalSpent();
  }

  getOverallPercentage(): number {
    const total = this.getTotalBudget();
    if (total === 0) return 0;
    return Math.round((this.getTotalSpent() / total) * 100);
  }

  getDaysRemaining(): number {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const diff = lastDay.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getAlertCount(): number {
    return this.budgets.filter(b => this.getBudgetPercentage(b) >= 80).length;
  }

  getBudgetPercentage(budget: Budget): number {
    if (budget.amount === 0) return 0;
    return Math.round(((budget.spent || 0) / budget.amount) * 100);
  }

  // Period selection
  selectPeriod(period: BudgetPeriod) {
    this.selectedPeriod = period;
    this.loadBudgets();
  }

  // Status helpers
  getStatusClass(percentage: number): string {
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    if (percentage >= 60) return 'caution';
    return 'good';
  }

  getStatusText(percentage: number): string {
    if (percentage >= 100) return 'Exceeded';
    if (percentage >= 80) return 'Warning';
    if (percentage >= 60) return 'Watch';
    return 'On Track';
  }

  getProgressClass(percentage: number): string {
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    return 'success';
  }

  // Category helpers
  getCategoryColor(categoryNameOrId: string | number): string {
    // If it's a number (categoryId), find the category
    if (typeof categoryNameOrId === 'number') {
      const category = this.categories.find(c => c.id === categoryNameOrId);
      if (category) {
        return category.color || this.categoryConfig[category.name]?.color || '#6C757D';
      }
    }
    // If it's a string (category name)
    return this.categoryConfig[categoryNameOrId]?.color || '#6C757D';
  }

  getCategoryIcon(categoryNameOrId: string | number): string {
    // If it's a number (categoryId), find the category
    if (typeof categoryNameOrId === 'number') {
      const category = this.categories.find(c => c.id === categoryNameOrId);
      if (category) {
        return category.icon || this.categoryConfig[category.name]?.icon || '📌';
      }
    }
    // If it's a string (category name)
    return this.categoryConfig[categoryNameOrId]?.icon || '📌';
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : `Category ${categoryId}`;
  }

  // Budget calculations
  getAverageSpending(budget: Budget): number {
    const daysInMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ).getDate();
    const daysPassed = new Date().getDate();
    
    if (daysPassed === 0) return 0;
    return (budget.spent || 0) / daysPassed;
  }

  // Budget tips
  getBudgetTips(): BudgetTip[] {
    const tips: BudgetTip[] = [];
    
    // Check for exceeded budgets
    const exceededBudgets = this.budgets.filter(b => this.getBudgetPercentage(b) >= 100);
    if (exceededBudgets.length > 0) {
      tips.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Budget Exceeded',
        message: `You've exceeded ${exceededBudgets.length} ${exceededBudgets.length === 1 ? 'budget' : 'budgets'}. Consider adjusting your spending.`
      });
    }

    // Check for approaching limits
    const warningBudgets = this.budgets.filter(
      b => this.getBudgetPercentage(b) >= 80 && this.getBudgetPercentage(b) < 100
    );
    if (warningBudgets.length > 0) {
      tips.push({
        type: 'warning',
        icon: '🚨',
        title: 'Approaching Limit',
        message: `${warningBudgets.length} ${warningBudgets.length === 1 ? 'budget is' : 'budgets are'} near their limit. Slow down spending in these categories.`
      });
    }

    // Check for healthy budgets
    const healthyBudgets = this.budgets.filter(b => this.getBudgetPercentage(b) < 60);
    if (healthyBudgets.length > 0) {
      tips.push({
        type: 'success',
        icon: '✅',
        title: 'Doing Great!',
        message: `${healthyBudgets.length} ${healthyBudgets.length === 1 ? 'budget is' : 'budgets are'} well within limits. Keep up the good work!`
      });
    }

    // Savings suggestion
    const remaining = this.getRemaining();
    if (remaining > 0) {
      tips.push({
        type: 'info',
        icon: '💡',
        title: 'Savings Opportunity',
        message: `You have ${this.formatCurrency(remaining)} remaining. Consider moving it to savings!`
      });
    }

    return tips;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Actions
  openCreateBudget() {
    this.editingBudget = null;
    this.budgetForm = this.getEmptyBudget();
    this.showForm = true;
    console.log('Opening create budget form');
  }

  getEmptyBudget(): Partial<Budget> {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      categoryId: this.categories.length > 0 ? this.categories[0].id : undefined,
      amount: 0,
      spent: 0,
      period: BudgetPeriod.MONTHLY,
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0],
      isActive: true
    };
  }

  saveBudget() {
    console.log('Saving budget:', this.budgetForm);
    
    if (!this.validateBudgetForm()) {
      return;
    }

    this.isLoading = true;

    if (this.editingBudget && this.editingBudget.id) {
      // Update existing budget
      console.log('Updating budget:', this.editingBudget.id);
      this.budgetService.update(this.editingBudget.id, this.budgetForm as Budget).subscribe({
        next: (updatedBudget) => {
          console.log('Budget updated successfully:', updatedBudget);
          this.toastService.success('Budget updated successfully!');
          this.closeForm();
          this.loadBudgets();
        },
        error: (error) => {
          console.error('Error updating budget:', error);
          this.toastService.error(error.message || 'Failed to update budget');
          this.isLoading = false;
        }
      });
    } else {
      // Create new budget
      console.log('Creating new budget');
      this.budgetService.create(this.budgetForm as Budget).subscribe({
        next: (createdBudget) => {
          console.log('Budget created successfully:', createdBudget);
          this.toastService.success('Budget created successfully!');
          this.closeForm();
          this.loadBudgets();
        },
        error: (error) => {
          console.error('Error creating budget:', error);
          this.toastService.error(error.message || 'Failed to create budget');
          this.isLoading = false;
        }
      });
    }
  }

  validateBudgetForm(): boolean {
    if (!this.budgetForm.categoryId || this.budgetForm.categoryId <= 0) {
      this.toastService.error('Please select a category');
      return false;
    }

    if (!this.budgetForm.amount || this.budgetForm.amount <= 0) {
      this.toastService.error('Budget amount must be greater than 0');
      return false;
    }

    if (!this.budgetForm.period) {
      this.toastService.error('Please select a period');
      return false;
    }

    if (!this.budgetForm.startDate || !this.budgetForm.endDate) {
      this.toastService.error('Start and end dates are required');
      return false;
    }

    return true;
  }

  closeForm() {
    this.showForm = false;
    this.editingBudget = null;
    this.budgetForm = this.getEmptyBudget();
  }

  editBudget(budget: Budget) {
    this.editingBudget = budget;
    this.budgetForm = { ...budget };
    this.showForm = true;
    console.log('Editing budget:', budget);
  }

  deleteBudget(budget: Budget) {
    if (!budget.id) {
      this.toastService.error('Cannot delete budget without ID');
      return;
    }

    const categoryName = this.getCategoryName(budget.categoryId);
    if (confirm(`Are you sure you want to delete the budget for "${categoryName}"?`)) {
      console.log('Deleting budget:', budget.id);
      
      // Don't set loading here - it will be set in loadBudgets()
      this.budgetService.delete(budget.id).subscribe({
        next: () => {
          console.log('Budget deleted successfully');
          this.toastService.success('Budget deleted successfully!');
          // Remove from local array immediately for better UX
          this.budgets = this.budgets.filter(b => b.id !== budget.id);
          // Then refresh from server
          this.loadBudgets();
        },
        error: (error) => {
          console.error('Error deleting budget:', error);
          this.toastService.error(error.error?.message || 'Failed to delete budget');
        }
      });
    }
  }

  refreshBudgets() {
    console.log('Refreshing budgets...');
    this.isLoading = true;
    
    this.budgetService.refresh().subscribe({
      next: () => {
        console.log('Budgets refreshed successfully');
        this.toastService.success('Budgets refreshed!');
        this.loadBudgets();
      },
      error: (error) => {
        console.error('Error refreshing budgets:', error);
        this.toastService.error('Failed to refresh budgets');
        this.isLoading = false;
      }
    });
  }

  openBudgetInsights() {
    // TODO: Open insights modal or page
    console.log('Open budget insights');
    this.toastService.info('Budget insights feature coming soon!');
  }

  // Track by for performance
  trackByBudgetId(index: number, budget: Budget): number {
    return budget.id || index;
  }
}