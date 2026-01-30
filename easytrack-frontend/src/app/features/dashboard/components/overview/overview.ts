import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

interface Transaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
}

interface Budget {
  category: string;
  spent: number;
  limit: number;
  percentage: number;
}

@Component({
  selector: 'app-overview',
  imports: [CommonModule],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class Overview implements OnInit {

 // Dashboard stats
  totalBalance: number = 0;
  monthlyIncome: number = 0;
  monthlyExpenses: number = 0;
  savingsRate: number = 0;

  // Recent Transactions
  recentTransactions: Transaction[] = [];

  // Budgets
  budgets: Budget[] = [];

  // Loading state
  isLoading: boolean = true;

  constructor() {}

  ngOnInit(): void {
    // Initialize with mock data
    this.loadMockData();
  }

  private loadMockData(): void {
    // Simulate async data loading
    globalThis.setTimeout(() => {
      // Set dashboard stats
      this.totalBalance = 45750.50;
      this.monthlyIncome = 25000;
      this.monthlyExpenses = 18250;
      this.savingsRate = 27;

      // Set recent transactions
      this.recentTransactions = [
        {
          id: '1',
          name: 'Salary',
          category: 'Income',
          amount: 25000,
          type: 'income',
          date: new Date()
        },
        {
          id: '2',
          name: 'Grocery Shopping',
          category: 'Food & Dining',
          amount: 850,
          type: 'expense',
          date: new Date()
        },
        {
          id: '3',
          name: 'Electric Bill',
          category: 'Utilities',
          amount: 450,
          type: 'expense',
          date: new Date()
        },
        {
          id: '4',
          name: 'Freelance Project',
          category: 'Income',
          amount: 3500,
          type: 'income',
          date: new Date()
        },
        {
          id: '5',
          name: 'Netflix Subscription',
          category: 'Entertainment',
          amount: 199,
          type: 'expense',
          date: new Date()
        }
      ];

      // Set budgets
      this.budgets = [
        {
          category: 'Food & Dining',
          spent: 2450,
          limit: 3000,
          percentage: 82
        },
        {
          category: 'Transportation',
          spent: 800,
          limit: 1500,
          percentage: 53
        },
        {
          category: 'Entertainment',
          spent: 650,
          limit: 1000,
          percentage: 65
        },
        {
          category: 'Shopping',
          spent: 1850,
          limit: 2000,
          percentage: 93
        }
      ];

      this.isLoading = false;
    }, 100);
  }

  // Calculate budget percentage dynamically if needed
  calculateBudgetPercentage(spent: number, limit: number): number {
    if (limit === 0) return 0;
    return Math.round((spent / limit) * 100);
  }

  // Get budget status class
  getBudgetStatusClass(percentage: number): string {
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    return 'success';
  }

  // Format transaction type
  getTransactionSign(type: 'income' | 'expense'): string {
    return type === 'income' ? '+' : '-';
  }

  // Track by functions for *ngFor performance
  trackByTransactionId(index: number, transaction: Transaction): string {
    return transaction.id;
  }

  trackByBudgetCategory(index: number, budget: Budget): string {
    return budget.category;
  }

}
