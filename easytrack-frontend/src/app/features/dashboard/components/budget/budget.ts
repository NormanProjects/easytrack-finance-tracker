import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  percentage: number;
  period: 'monthly' | 'weekly' | 'yearly';
  transactionCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
interface BudgetTip {
  type: 'success' | 'warning' | 'info';
  icon: string;
  title: string;
  message: string;
}

interface Period {
  label: string;
  value: 'monthly' | 'weekly' | 'yearly';
}
@Component({
  selector: 'app-budget',
  imports: [CommonModule, FormsModule],
  templateUrl: './budget.html',
  styleUrl: './budget.css',
})
export class BudgetComponent implements OnInit {
  budgets: Budget[] = [];
  selectedPeriod: 'monthly' | 'weekly' | 'yearly' = 'monthly';
  isLoading: boolean = true;

  periods: Period[] = [
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' }
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

  ngOnInit() {
    this.loadBudgets();
  }

  private loadBudgets() {
    // Simulate API call with mock data
    setTimeout(() => {
      this.budgets = this.generateMockBudgets();
      this.isLoading = false;
    }, 800);
  }

  private generateMockBudgets(): Budget[] {
    const now = new Date();
    
    return [
      {
        id: '1',
        category: 'Food & Dining',
        limit: 3000,
        spent: 2450,
        percentage: 82,
        period: 'monthly',
        transactionCount: 15,
        createdAt: new Date(now.getFullYear(), now.getMonth(), 1),
        updatedAt: now
      },
      {
        id: '2',
        category: 'Transportation',
        limit: 1500,
        spent: 800,
        percentage: 53,
        period: 'monthly',
        transactionCount: 8,
        createdAt: new Date(now.getFullYear(), now.getMonth(), 1),
        updatedAt: now
      },
      {
        id: '3',
        category: 'Entertainment',
        limit: 1000,
        spent: 650,
        percentage: 65,
        period: 'monthly',
        transactionCount: 5,
        createdAt: new Date(now.getFullYear(), now.getMonth(), 1),
        updatedAt: now
      },
      {
        id: '4',
        category: 'Shopping',
        limit: 2000,
        spent: 2100,
        percentage: 105,
        period: 'monthly',
        transactionCount: 12,
        createdAt: new Date(now.getFullYear(), now.getMonth(), 1),
        updatedAt: now
      },
      {
        id: '5',
        category: 'Bills & Utilities',
        limit: 2500,
        spent: 1850,
        percentage: 74,
        period: 'monthly',
        transactionCount: 6,
        createdAt: new Date(now.getFullYear(), now.getMonth(), 1),
        updatedAt: now
      },
      {
        id: '6',
        category: 'Healthcare',
        limit: 1000,
        spent: 250,
        percentage: 25,
        period: 'monthly',
        transactionCount: 2,
        createdAt: new Date(now.getFullYear(), now.getMonth(), 1),
        updatedAt: now
      }
    ];
  }

  // Summary calculations
  getTotalBudget(): number {
    return this.budgets.reduce((sum, budget) => sum + budget.limit, 0);
  }

  getTotalSpent(): number {
    return this.budgets.reduce((sum, budget) => sum + budget.spent, 0);
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
    return this.budgets.filter(b => b.percentage >= 80).length;
  }

  // Period selection
  selectPeriod(period: 'monthly' | 'weekly' | 'yearly') {
    this.selectedPeriod = period;
    this.isLoading = true;
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
  getCategoryColor(category: string): string {
    return this.categoryConfig[category]?.color || '#6C757D';
  }

  getCategoryIcon(category: string): string {
    return this.categoryConfig[category]?.icon || '📌';
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
    return budget.spent / daysPassed;
  }

  // Budget tips
  getBudgetTips(): BudgetTip[] {
    const tips: BudgetTip[] = [];
    
    // Check for exceeded budgets
    const exceededBudgets = this.budgets.filter(b => b.percentage >= 100);
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
      b => b.percentage >= 80 && b.percentage < 100
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
    const healthyBudgets = this.budgets.filter(b => b.percentage < 60);
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
    // TODO: Open create budget modal
    console.log('Open create budget modal');
  }

  editBudget(budget: Budget) {
    // TODO: Open edit budget modal
    console.log('Edit budget:', budget);
  }

  deleteBudget(budget: Budget) {
    // TODO: Show confirmation dialog
    if (confirm(`Are you sure you want to delete the budget for "${budget.category}"?`)) {
      this.budgets = this.budgets.filter(b => b.id !== budget.id);
      console.log('Deleted budget:', budget);
    }
  }

  openBudgetInsights() {
    // TODO: Open insights modal or page
    console.log('Open budget insights');
  }

  // Track by for performance
  trackByBudgetId(index: number, budget: Budget): string {
    return budget.id;
  }
}