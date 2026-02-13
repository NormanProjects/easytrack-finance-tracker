import { Transaction } from './transaction.model';

export interface DashboardSummary {
  totalSavings: number;
  savingsRate: number;
  avgDailySpending: number;
  activeBudgets: number;
  totalBudgets: number;
  transactionsCount: number;
  budgets: never[];
  monthlyChange: number;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  activeGoals: number;
  incomeChange: number;
  expenseChange: number;
  spendingBreakdown: SpendingCategory[];
  recentTransactions: Transaction[];
  safeToSpendDaily?: number;
  daysRemainingInMonth?: number;
}

export interface SpendingCategory {
  categoryName: string;
  amount: number;
  percentage: number;
  color?: string;
}