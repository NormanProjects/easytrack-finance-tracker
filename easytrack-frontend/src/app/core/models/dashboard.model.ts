
export interface DashboardSummary {
  totalBalance: number | null;
  monthlyIncome: number | null;
  monthlyExpense: number | null;      
  netIncome: number | null;
  budgetSummary: BudgetSummary | null;
  spendingComparison: SpendingComparison | null;
  quickStats: QuickStats | null;
  recentTransactions: TransactionSummary[] | null;
}

export interface BudgetSummary {
  totalBudget: number | null;
  totalSpent: number | null;
  remaining: number | null;
  percentageUsed: number | null;
  safeToSpendDaily: number | null;
  daysRemainingInMonth: number;
}

export interface SpendingComparison {
  currentMonthSpending: number | null;
  previousMonthSpending: number | null;
  difference: number | null;
  percentageChange: number | null;
  trend: 'UP' | 'DOWN' | 'STABLE' | null;
}

export interface QuickStats {
  totalAccounts: number;
  activeAccounts: number;
  totalTransactions: number;
  monthlyTransactions: number;
  lastTransactionDate: string | null;
}

export interface TransactionSummary {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense' | 'INCOME' | 'EXPENSE';
  date: string;
}